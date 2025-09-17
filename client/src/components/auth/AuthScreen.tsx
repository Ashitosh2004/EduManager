import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useInstitute } from '@/contexts/InstituteContext';
import { validateEmailDomain } from '@/lib/firebase';
import { School, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInForm = z.infer<typeof signInSchema>;

export const AuthScreen: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const { selectedInstitute } = useInstitute();
  const { toast } = useToast();

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleEmailSignIn = async (data: SignInForm) => {
    if (!selectedInstitute) {
      toast({
        title: "Error",
        description: "Please select an institute first.",
        variant: "destructive",
      });
      return;
    }

    // Validate email domain
    if (!validateEmailDomain(data.email, selectedInstitute.domain)) {
      toast({
        title: "Invalid Email Domain",
        description: `Please use an email ending with ${selectedInstitute.domain}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await signIn(data.email, data.password);
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Google Sign In Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <School className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to EduManager</h1>
            <p className="text-muted-foreground">Sign in to your faculty account</p>
            {selectedInstitute && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-institute-domain">
                Domain: {selectedInstitute.domain}
              </p>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center">Faculty Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleEmailSignIn)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={`faculty${selectedInstitute?.domain || '@institute.edu'}`}
                    {...form.register('email')}
                    data-testid="input-email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...form.register('password')}
                      data-testid="input-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-sign-in"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center space-x-2" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                data-testid="button-google-signin"
              >
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs text-primary-foreground font-bold">G</span>
                </div>
                <span>Sign in with Google</span>
              </Button>
              
              <div className="text-center mt-6">
                <Button variant="link" className="text-primary" data-testid="link-forgot-password">
                  Forgot your password?
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
        <div className="text-center text-primary-foreground max-w-lg">
          <div className="w-64 h-64 mx-auto mb-8 bg-primary-foreground/20 rounded-3xl flex items-center justify-center">
            <School className="h-24 w-24" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Manage Your Institution</h2>
          <p className="text-xl opacity-90">
            Streamline student, faculty, and course management with powerful tools designed for modern educational institutions.
          </p>
        </div>
      </div>
    </div>
  );
};
