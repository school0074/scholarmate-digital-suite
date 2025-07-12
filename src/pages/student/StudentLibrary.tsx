import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Search,
  Filter,
  Calendar,
  Clock,
  Download,
  Star,
  Eye,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Book,
  User,
  Hash,
  Globe,
} from "lucide-react";
import { format, formatDistance, isPast } from "date-fns";

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  category: string | null;
  description: string | null;
  total_copies: number;
  available_copies: number;
  cover_image_url: string | null;
  digital_copy_url: string | null;
  created_at: string;
}

interface BookBorrow {
  id: string;
  book_id: string;
  user_id: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: "borrowed" | "returned" | "overdue";
  library_books: LibraryBook;
}

const StudentLibrary = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BookBorrow[]>([]);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    if (profile) {
      loadLibraryData();
    }
  }, [profile]);

  const loadLibraryData = async () => {
    try {
      setLoading(true);

      // Load all library books
      const { data: booksData, error: booksError } = await supabase
        .from("library_books")
        .select("*")
        .order("title");

      if (booksError) {
        console.error("Error loading books:", booksError);
        throw booksError;
      }

      setBooks(booksData || []);

      // Load user's borrowed books
      const { data: borrowsData, error: borrowsError } = await supabase
        .from("book_borrows")
        .select(
          `
          id,
          book_id,
          user_id,
          borrowed_at,
          due_date,
          returned_at,
          status,
          library_books (
            id,
            title,
            author,
            isbn,
            category,
            description,
            total_copies,
            available_copies,
            cover_image_url,
            digital_copy_url,
            created_at
          )
        `,
        )
        .eq("user_id", profile.id)
        .order("borrowed_at", { ascending: false });

      if (borrowsError) {
        console.error("Error loading borrowed books:", borrowsError);
        throw borrowsError;
      }

      setBorrowedBooks(borrowsData || []);
    } catch (error) {
      console.error("Error loading library data:", error);
      toast({
        title: "Error",
        description: "Failed to load library data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const borrowBook = async (bookId: string) => {
    if (!profile?.id) return;

    try {
      setBorrowing(true);

      // Check if book is available
      const book = books.find((b) => b.id === bookId);
      if (!book || book.available_copies <= 0) {
        toast({
          title: "Error",
          description: "This book is currently not available",
          variant: "destructive",
        });
        return;
      }

      // Check if user already has this book borrowed
      const existingBorrow = borrowedBooks.find(
        (b) => b.book_id === bookId && b.status === "borrowed",
      );
      if (existingBorrow) {
        toast({
          title: "Error",
          description: "You have already borrowed this book",
          variant: "destructive",
        });
        return;
      }

      // Create borrow record (due date is 14 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const { error: borrowError } = await supabase
        .from("book_borrows")
        .insert({
          book_id: bookId,
          user_id: profile.id,
          due_date: dueDate.toISOString(),
          status: "borrowed",
        });

      if (borrowError) {
        console.error("Error borrowing book:", borrowError);
        throw borrowError;
      }

      // Update available copies
      const { error: updateError } = await supabase
        .from("library_books")
        .update({
          available_copies: book.available_copies - 1,
        })
        .eq("id", bookId);

      if (updateError) {
        console.error("Error updating book availability:", updateError);
        throw updateError;
      }

      toast({
        title: "Success",
        description: `"${book.title}" has been borrowed successfully. Due date: ${format(dueDate, "PPP")}`,
      });

      // Reload data to reflect changes
      await loadLibraryData();
      setSelectedBook(null);
    } catch (error) {
      console.error("Error borrowing book:", error);
      toast({
        title: "Error",
        description: "Failed to borrow book",
        variant: "destructive",
      });
    } finally {
      setBorrowing(false);
    }
  };

  const returnBook = async (borrowId: string) => {
    try {
      // Get the borrow record to find the book
      const borrow = borrowedBooks.find((b) => b.id === borrowId);
      if (!borrow) return;

      // Update borrow record as returned
      const { error: borrowError } = await supabase
        .from("book_borrows")
        .update({
          returned_at: new Date().toISOString(),
          status: "returned",
        })
        .eq("id", borrowId);

      if (borrowError) {
        console.error("Error returning book:", borrowError);
        throw borrowError;
      }

      // Update available copies
      const book = books.find((b) => b.id === borrow.book_id);
      if (book) {
        const { error: updateError } = await supabase
          .from("library_books")
          .update({
            available_copies: book.available_copies + 1,
          })
          .eq("id", borrow.book_id);

        if (updateError) {
          console.error("Error updating book availability:", updateError);
          throw updateError;
        }
      }

      toast({
        title: "Success",
        description: `"${borrow.library_books.title}" has been returned successfully`,
      });

      // Reload data to reflect changes
      await loadLibraryData();
    } catch (error) {
      console.error("Error returning book:", error);
      toast({
        title: "Error",
        description: "Failed to return book",
        variant: "destructive",
      });
    }
  };

  const getFilteredBooks = () => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.isbn &&
          book.isbn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (book.category &&
          book.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === "all" || book.category === categoryFilter;

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && book.available_copies > 0) ||
        (availabilityFilter === "unavailable" && book.available_copies === 0);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  };

  const getCategories = () => {
    const categories = [
      ...new Set(books.map((book) => book.category).filter(Boolean)),
    ];
    return categories.sort();
  };

  const getCurrentBorrows = () => {
    return borrowedBooks.filter((borrow) => borrow.status === "borrowed");
  };

  const getOverdueBooks = () => {
    return getCurrentBorrows().filter((borrow) =>
      isPast(new Date(borrow.due_date)),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Library</h1>
          <p className="text-muted-foreground">
            Browse and borrow books from the school library
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Books</p>
                <p className="text-2xl font-bold">{books.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Book className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Currently Borrowed
                </p>
                <p className="text-2xl font-bold">
                  {getCurrentBorrows().length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{getOverdueBooks().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">
                  {books.filter((book) => book.available_copies > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Browse Books</TabsTrigger>
          <TabsTrigger value="borrowed">
            My Books ({getCurrentBorrows().length})
          </TabsTrigger>
          <TabsTrigger value="history">Borrow History</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books by title, author, ISBN, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getCategories().map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={availabilityFilter}
              onValueChange={setAvailabilityFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Books Grid */}
          {selectedBook ? (
            <BookDetails
              book={selectedBook}
              onBack={() => setSelectedBook(null)}
              onBorrow={borrowBook}
              borrowing={borrowing}
              isAlreadyBorrowed={getCurrentBorrows().some(
                (b) => b.book_id === selectedBook.id,
              )}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredBooks().map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => setSelectedBook(book)}
                  isAlreadyBorrowed={getCurrentBorrows().some(
                    (b) => b.book_id === book.id,
                  )}
                />
              ))}
              {getFilteredBooks().length === 0 && (
                <div className="col-span-full text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No books found matching your criteria
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="borrowed" className="space-y-6">
          <div className="space-y-4">
            {getCurrentBorrows().map((borrow) => (
              <BorrowedBookCard
                key={borrow.id}
                borrow={borrow}
                onReturn={returnBook}
              />
            ))}
            {getCurrentBorrows().length === 0 && (
              <div className="text-center py-8">
                <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  You have no books currently borrowed
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="space-y-4">
            {borrowedBooks.map((borrow) => (
              <BorrowHistoryCard key={borrow.id} borrow={borrow} />
            ))}
            {borrowedBooks.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No borrow history found</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface BookCardProps {
  book: LibraryBook;
  onClick: () => void;
  isAlreadyBorrowed: boolean;
}

const BookCard = ({ book, onClick, isAlreadyBorrowed }: BookCardProps) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge
                variant={book.available_copies > 0 ? "default" : "destructive"}
                className="text-xs"
              >
                {book.available_copies > 0 ? "Available" : "Unavailable"}
              </Badge>
              {isAlreadyBorrowed && (
                <Badge variant="outline" className="text-xs">
                  Borrowed
                </Badge>
              )}
            </div>
          </div>

          {book.category && (
            <Badge variant="secondary" className="text-xs">
              {book.category}
            </Badge>
          )}

          <div className="text-xs text-muted-foreground">
            {book.available_copies}/{book.total_copies} copies available
          </div>

          {book.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {book.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface BookDetailsProps {
  book: LibraryBook;
  onBack: () => void;
  onBorrow: (bookId: string) => void;
  borrowing: boolean;
  isAlreadyBorrowed: boolean;
}

const BookDetails = ({
  book,
  onBack,
  onBorrow,
  borrowing,
  isAlreadyBorrowed,
}: BookDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>{book.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Book Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Author:</span>
                  <span>{book.author}</span>
                </div>
                {book.isbn && (
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">ISBN:</span>
                    <span>{book.isbn}</span>
                  </div>
                )}
                {book.category && (
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Category:</span>
                    <span>{book.category}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Availability:</span>
                  <span>
                    {book.available_copies}/{book.total_copies} copies
                  </span>
                </div>
              </div>
            </div>

            {book.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {book.description}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => onBorrow(book.id)}
                disabled={
                  borrowing || book.available_copies <= 0 || isAlreadyBorrowed
                }
                className="w-full"
              >
                {borrowing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {isAlreadyBorrowed
                  ? "Already Borrowed"
                  : book.available_copies <= 0
                    ? "Not Available"
                    : "Borrow Book"}
              </Button>

              {book.digital_copy_url && (
                <Button variant="outline" className="w-full">
                  <Globe className="h-4 w-4 mr-2" />
                  View Digital Copy
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              <p>• Books can be borrowed for 14 days</p>
              <p>• Late returns may incur fines</p>
              <p>• Digital copies are available 24/7</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface BorrowedBookCardProps {
  borrow: BookBorrow;
  onReturn: (borrowId: string) => void;
}

const BorrowedBookCard = ({ borrow, onReturn }: BorrowedBookCardProps) => {
  const isOverdue = isPast(new Date(borrow.due_date));
  const daysUntilDue = Math.ceil(
    (new Date(borrow.due_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <Card
      className={
        isOverdue ? "border-red-200 bg-red-50/50 dark:bg-red-950/20" : ""
      }
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold">{borrow.library_books.title}</h3>
            <p className="text-sm text-muted-foreground">
              {borrow.library_books.author}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
              <span>
                Borrowed: {format(new Date(borrow.borrowed_at), "PPP")}
              </span>
              <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                Due: {format(new Date(borrow.due_date), "PPP")}
                {isOverdue ? " (OVERDUE)" : ` (${daysUntilDue} days)`}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
            <Button
              size="sm"
              onClick={() => onReturn(borrow.id)}
              variant={isOverdue ? "destructive" : "outline"}
            >
              Return Book
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface BorrowHistoryCardProps {
  borrow: BookBorrow;
}

const BorrowHistoryCard = ({ borrow }: BorrowHistoryCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold">{borrow.library_books.title}</h3>
            <p className="text-sm text-muted-foreground">
              {borrow.library_books.author}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
              <span>
                Borrowed: {format(new Date(borrow.borrowed_at), "PPP")}
              </span>
              {borrow.returned_at && (
                <span>
                  Returned: {format(new Date(borrow.returned_at), "PPP")}
                </span>
              )}
              <span>Due: {format(new Date(borrow.due_date), "PPP")}</span>
            </div>
          </div>
          <Badge
            variant={
              borrow.status === "returned"
                ? "default"
                : borrow.status === "overdue"
                  ? "destructive"
                  : "secondary"
            }
            className="capitalize"
          >
            {borrow.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentLibrary;
