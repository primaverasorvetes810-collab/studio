'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUser, useAuth, useFirestore, useStorage } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { uploadFileAndGetURL } from '@/firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Camera, User as UserIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { User } from '@/firebase/orders';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allowedNeighborhoods } from '@/lib/data/shipping-neighborhoods';
import { ScrollArea } from '@/components/ui/scroll-area';

const profileSchema = z.object({
  fullName: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "E-mail inválido." }),
  birthDate: z.string().min(1, { message: "A data de nascimento é obrigatória." }),
  phone: z.string().min(1, { message: "O telefone é obrigatório." }),
  address: z.string().min(1, { message: "O endereço é obrigatório." }),
  neighborhood: z.string().min(1, { message: "O bairro é obrigatório." }),
  city: z.string().min(1, { message: "A cidade é obrigatória." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const router = useRouter();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<User | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      birthDate: '',
      phone: '',
      address: '',
      neighborhood: '',
      city: '',
    },
  });

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    
    const fetchProfile = async () => {
      const userDocRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as User;
        setProfileData(data);
        form.reset({
            fullName: data.fullName || '',
            email: user.email || '',
            birthDate: data.birthDate || '',
            phone: data.phone || '',
            address: data.address || '',
            neighborhood: data.neighborhood || '',
            city: data.city || '',
        });
        setImagePreview(user.photoURL);
      }
      setIsPageLoading(false);
    };

    fetchProfile();
  }, [user, isUserLoading, firestore, form, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSaving(true);
    setUploadProgress(0);

    try {
      let photoURL = user.photoURL;

      if (imageFile) {
        photoURL = await uploadFileAndGetURL(storage, imageFile, 'avatars', setUploadProgress);
        await updateProfile(user, { photoURL });
      }

      const userDataToUpdate = {
        ...data,
        photoURL: photoURL || '',
      };
      
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, userDataToUpdate, { merge: true });

      toast({
        title: 'Sucesso!',
        description: 'Seu perfil foi atualizado.',
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Atualizar",
        description: "Ocorreu um erro ao atualizar seu perfil.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  if (isUserLoading || isPageLoading) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader
        title="Meu Perfil"
        description="Atualize suas informações pessoais e foto."
      />
      <Card className="mt-8">
        <CardContent className="p-6 pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                 <div className="relative group">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={imagePreview ?? undefined} alt={profileData?.fullName} />
                        <AvatarFallback className="text-3xl">
                            {profileData ? getInitials(profileData.fullName) : <UserIcon />}
                        </AvatarFallback>
                    </Avatar>
                    <Button 
                        type="button"
                        variant="outline" 
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full group-hover:bg-accent"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Camera className="h-5 w-5"/>
                        <span className="sr-only">Trocar foto</span>
                    </Button>
                    <Input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/webp"
                    />
                 </div>
                 <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold">{form.getValues('fullName')}</h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                 </div>
              </div>

              {isSaving && imageFile && <Progress value={uploadProgress} className="w-full" />}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl><Input {...field} readOnly disabled /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione seu bairro" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <ScrollArea className="h-72">
                                        {allowedNeighborhoods.map((neighborhood) => (
                                            <SelectItem key={neighborhood} value={neighborhood}>
                                            {neighborhood}
                                            </SelectItem>
                                        ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
