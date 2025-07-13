import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, Calendar, MapPin, User } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface TimetableEntry {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject_id: string;
  teacher_id: string;
  room_number: string;
  class_id: string;
}

const StudentTimetable = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = [
    "Sunday",
    "Monday", 
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  useEffect(() => {
    if (profile) {
      loadTimetable();
    }
  }, [profile]);

  const loadTimetable = async () => {
    try {
      setLoading(true);

      // Get student's class
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("student_enrollments")
        .select("class_id")
        .eq("student_id", profile?.id)
        .single();

      if (enrollmentError) throw enrollmentError;

      // Get timetable for the class
      const { data, error } = await supabase
        .from("timetable")
        .select("*")
        .eq("class_id", enrollment.class_id)
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;

      setTimetable(data || []);
    } catch (error) {
      console.error("Error loading timetable:", error);
      toast({
        title: "Error",
        description: "Failed to load timetable",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTodaySchedule = () => {
    const today = new Date().getDay();
    return timetable.filter(entry => entry.day_of_week === today);
  };

  const groupByDay = () => {
    const grouped: { [key: number]: TimetableEntry[] } = {};
    timetable.forEach(entry => {
      if (!grouped[entry.day_of_week]) {
        grouped[entry.day_of_week] = [];
      }
      grouped[entry.day_of_week].push(entry);
    });
    return grouped;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const todaySchedule = getTodaySchedule();
  const groupedTimetable = groupByDay();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timetable</h1>
        <p className="text-muted-foreground">
          Your class schedule and timings
        </p>
      </div>

      {/* Today's Schedule */}
      {todaySchedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Today's Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">
                      {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                    </Badge>
                    <div>
                      <p className="font-medium">Subject {entry.subject_id}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Room {entry.room_number}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule */}
      <div className="grid gap-4">
        {daysOfWeek.slice(1, 6).map((day, index) => {
          const dayNumber = index + 1;
          const daySchedule = groupedTimetable[dayNumber] || [];
          
          return (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>{day}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {daySchedule.length > 0 ? (
                  <div className="space-y-3">
                    {daySchedule.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">
                            {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                          </Badge>
                          <div>
                            <p className="font-medium">Subject {entry.subject_id}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>Room {entry.room_number}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>Teacher</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No classes scheduled
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StudentTimetable;