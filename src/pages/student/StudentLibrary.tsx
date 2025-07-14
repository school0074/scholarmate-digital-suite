import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  category: string | null;
  description: string | null;
  available_copies: number;
  total_copies: number;
  cover_image_url: string | null;
}

interface BookBorrow {
  id: string;
  book_id: string;
  user_id: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: string;
  library_books: LibraryBook;
}

const StudentLibrary = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BookBorrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (profile) {
      loadLibraryData();
    }
  }, [profile]);

  const loadLibraryData = async () => {
    try {
      setLoading(true);

      // Load available books
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
        .select(`
          *,
          library_books (*)
        `)
        .eq("user_id", profile?.id)
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
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks from now

      const { error } = await supabase.from("book_borrows").insert({
        book_id: bookId,
        user_id: profile.id,
        due_date: dueDate.toISOString().split('T')[0],
        status: "borrowed",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Book borrowed successfully",
      });

      await loadLibraryData();
    } catch (error) {
      console.error("Error borrowing book:", error);
      toast({
        title: "Error",
        description: "Failed to borrow book",
        variant: "destructive",
      });
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="text-muted-foreground">
          Browse and borrow books from our digital library
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books by title, author, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Borrowed Books */}
      {borrowedBooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Borrowed Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {borrowedBooks.map((borrow) => (
                <div
                  key={borrow.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{borrow.library_books.title}</p>
                      <p className="text-sm text-muted-foreground">
                        by {borrow.library_books.author}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={borrow.status === "returned" ? "default" : "secondary"}>
                      {borrow.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Due: {new Date(borrow.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Books */}
      <Card>
        <CardHeader>
          <CardTitle>Available Books ({filteredBooks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="h-full">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                      <p className="text-sm text-muted-foreground">by {book.author}</p>
                    </div>

                    {book.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {book.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      {book.category && (
                        <Badge variant="outline">{book.category}</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {book.available_copies}/{book.total_copies} available
                      </span>
                    </div>

                    <Button
                      onClick={() => borrowBook(book.id)}
                      disabled={book.available_copies === 0}
                      className="w-full"
                      size="sm"
                    >
                      {book.available_copies === 0 ? "Not Available" : "Borrow Book"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No books found matching your search" : "No books available"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentLibrary;