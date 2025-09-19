import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { InstituteProvider } from "@/contexts/InstituteContext";
import { AppShell } from "@/components/AppShell";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <AppShell />} />
      <Route path="/students" component={() => <AppShell page="students" />} />
      <Route path="/faculty" component={() => <AppShell page="faculty" />} />
      <Route path="/courses" component={() => <AppShell page="courses" />} />
      <Route path="/timetable" component={() => <AppShell page="timetable" />} />
      <Route path="/timetable-history" component={() => <AppShell page="timetable-history" />} />
      <Route path="/more" component={() => <AppShell page="more" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <InstituteProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </InstituteProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
