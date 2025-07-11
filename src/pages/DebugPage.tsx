import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DebugPage = () => {
  const { user, profile, session } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testSupabaseConnection = async () => {
    try {
      addResult("Testing Supabase connection...");
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .single();

      if (error) {
        addResult(`Connection test failed: ${error.message}`);
      } else {
        addResult("Supabase connection successful");
      }
    } catch (error) {
      addResult(`Connection error: ${error}`);
    }
  };

  const testAuthUser = async () => {
    try {
      addResult("Testing auth.getUser()...");
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        addResult(`Auth test failed: ${error.message}`);
      } else {
        addResult(`Auth user: ${data.user?.email || "No user"}`);
      }
    } catch (error) {
      addResult(`Auth error: ${error}`);
    }
  };

  const testProfileFetch = async () => {
    if (!user) {
      addResult("No user logged in");
      return;
    }

    try {
      addResult(`Fetching profile for user: ${user.id}`);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        addResult(
          `Profile fetch error: ${error.message} (Code: ${error.code})`,
        );
        addResult(`Error details: ${JSON.stringify(error.details)}`);
        addResult(`Error hint: ${error.hint}`);
      } else {
        addResult(`Profile fetch successful: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      addResult(`Profile fetch exception: ${error}`);
    }
  };

  const testProfileCreate = async () => {
    if (!user) {
      addResult("No user logged in");
      return;
    }

    try {
      addResult(`Creating profile for user: ${user.id}`);

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email || "",
          full_name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User",
          role: "student",
        })
        .select()
        .single();

      if (error) {
        addResult(
          `Profile create error: ${error.message} (Code: ${error.code})`,
        );
      } else {
        addResult(`Profile created successfully: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      addResult(`Profile create exception: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug Page</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Session:</strong> {session ? "Active" : "None"}
            </div>
            <div>
              <strong>User:</strong> {user ? user.email : "None"}
            </div>
            <div>
              <strong>User ID:</strong> {user?.id || "None"}
            </div>
            <div>
              <strong>Profile:</strong>{" "}
              {profile ? JSON.stringify(profile) : "None"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={testSupabaseConnection} className="w-full">
              Test Supabase Connection
            </Button>
            <Button onClick={testAuthUser} className="w-full">
              Test Auth User
            </Button>
            <Button onClick={testProfileFetch} className="w-full">
              Test Profile Fetch
            </Button>
            <Button onClick={testProfileCreate} className="w-full">
              Test Profile Create
            </Button>
            <Button onClick={clearResults} variant="outline" className="w-full">
              Clear Results
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-h-80 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">No test results yet</p>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {testResults.map((result, index) => (
                  <div key={index}>{result}</div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPage;
