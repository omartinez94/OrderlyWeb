import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Toaster, toast } from '@/components/ui/sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useZodForm } from '@/lib/forms';
import { z } from 'zod';

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <h2 className="text-ink mb-2 text-2xl font-bold tracking-tight">{title}</h2>
      {description && (
        <p className="text-ink-muted mb-6 max-w-3xl leading-relaxed">{description}</p>
      )}
      {children}
    </section>
  );
}

const orderSchema = z.object({
  email: z.string().email('Enter a valid email.'),
});

/**
 * ShowcasePage — the single source of truth for what every
 * primitive looks like in light and dark. Mounted at `?showcase=1`
 * during development; lazy-loaded so the production bundle stays
 * lean.
 */
export default function ShowcasePage() {
  const form = useZodForm(orderSchema, { defaultValues: { email: '' } });

  return (
    <TooltipProvider delayDuration={150}>
      <Toaster />
      <div className="bg-surface text-ink min-h-screen font-sans antialiased">
        <header className="bg-surface-elevated border-border-subtle sticky top-0 z-30 border-b px-8 py-4">
          <h1 className="text-ink text-xl font-bold">Base Component Library — Showcase</h1>
          <p className="text-ink-muted text-sm">
            Every primitive in every variant. Lazy-loaded behind
            <code className="mx-1 font-mono text-xs">?showcase=1</code>.
          </p>
          <nav className="text-ink-muted mt-2 flex flex-wrap gap-3 text-xs">
            {['button', 'form', 'selection', 'layout', 'overlay', 'data', 'navigation'].map((s) => (
              <a key={s} href={`#${s}`} className="hover:text-ink">
                {s}
              </a>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-8 py-12">
          <Section
            id="button"
            title="Button"
            description="Variants and sizes. Burnt Tangerine is reserved for urgent CTAs only."
          >
            <div className="mb-4 flex flex-wrap gap-3">
              <Button variant="default">Primary</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Settings">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </Section>

          <Section
            id="form"
            title="Form"
            description="React Hook Form + Zod. FormControl wires aria-describedby automatically."
          >
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="plain">Email</Label>
                <Input id="plain" type="email" placeholder="staff@acme.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ta">Notes</Label>
                <Textarea id="ta" rows={3} placeholder="Notes…" />
              </div>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(() => undefined)} className="grid max-w-sm gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (with error)</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
                      </FormControl>
                      <FormDescription>Used for the digital receipt.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </Section>

          <Section
            id="selection"
            title="Selection"
            description="Selection controls — checkbox, switch, radio, select, slider, toggle."
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Checkbox</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="cb-1" />
                    <Label htmlFor="cb-1">Unchecked</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="cb-2" defaultChecked />
                    <Label htmlFor="cb-2">Checked</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="cb-3" disabled />
                    <Label htmlFor="cb-3">Disabled</Label>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Switch</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Switch id="sw-1" />
                    <Label htmlFor="sw-1">Off</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="sw-2" defaultChecked />
                    <Label htmlFor="sw-2">On</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="sw-3" size="sm" />
                    <Label htmlFor="sw-3">Small</Label>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>RadioGroup</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup defaultValue="a">
                    {['a', 'b', 'c'].map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <RadioGroupItem value={v} id={`r-${v}`} />
                        <Label htmlFor={`r-${v}`}>Option {v.toUpperCase()}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Select</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a station" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grill">Grill</SelectItem>
                      <SelectItem value="saute">Sauté</SelectItem>
                      <SelectItem value="pastry">Pastry</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Slider</CardTitle>
                </CardHeader>
                <CardContent>
                  <Slider aria-label="Volume" defaultValue={[40]} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>ToggleGroup</CardTitle>
                </CardHeader>
                <CardContent>
                  <ToggleGroup type="single" defaultValue="day">
                    <ToggleGroupItem value="day">Day</ToggleGroupItem>
                    <ToggleGroupItem value="week">Week</ToggleGroupItem>
                    <ToggleGroupItem value="month">Month</ToggleGroupItem>
                  </ToggleGroup>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section
            id="layout"
            title="Layout"
            description="Card variants, Tabs, Accordion, ScrollArea, Separator."
          >
            <div className="mb-6 grid gap-6 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Default</CardTitle>
                </CardHeader>
                <CardContent>Flat bg-card.</CardContent>
              </Card>
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Bordered</CardTitle>
                </CardHeader>
                <CardContent>1px ring.</CardContent>
              </Card>
              <Card variant="surface">
                <CardHeader>
                  <CardTitle>Surface</CardTitle>
                </CardHeader>
                <CardContent>Recedes to bg-surface.</CardContent>
              </Card>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tabs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="a">
                    <TabsList>
                      <TabsTrigger value="a">Tab A</TabsTrigger>
                      <TabsTrigger value="b">Tab B</TabsTrigger>
                    </TabsList>
                    <TabsContent value="a">Content A</TabsContent>
                    <TabsContent value="b">Content B</TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Accordion</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="a">
                      <AccordionTrigger>Item A</AccordionTrigger>
                      <AccordionContent>Body A</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="b">
                      <AccordionTrigger>Item B</AccordionTrigger>
                      <AccordionContent>Body B</AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
            <Separator className="my-6" />
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>ScrollArea</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="border-border-subtle h-32 w-full rounded-md border p-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <p key={i} className="text-ink-muted py-1 text-sm">
                        Line {i + 1}
                      </p>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Collapsible</CardTitle>
                </CardHeader>
                <CardContent>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm">
                        Show advanced
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="text-ink-muted mt-2 text-sm">
                      Advanced settings live here.
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>AspectRatio</CardTitle>
                </CardHeader>
                <CardContent>
                  <AspectRatio ratio={16 / 9} className="bg-muted rounded-md">
                    <div className="text-ink-subtle flex h-full items-center justify-center font-mono text-xs">
                      16:9
                    </div>
                  </AspectRatio>
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section
            id="overlay"
            title="Overlay"
            description="Focus-safe overlays: Dialog, Sheet, Popover, Tooltip, DropdownMenu, AlertDialog, Command, HoverCard."
          >
            <div className="mb-6 flex flex-wrap gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog</DialogTitle>
                    <DialogDescription>Modal confirmation.</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Sheet</SheetTitle>
                    <SheetDescription>Edge-anchored panel.</SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent>Popover body.</PopoverContent>
              </Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover for Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>Helpful text</TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open DropdownMenu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Order</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Mark ready</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Open AlertDialog</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm</AlertDialogTitle>
                    <AlertDialogDescription>Cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Confirm</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="outline">HoverCard</Button>
                </HoverCardTrigger>
                <HoverCardContent>Bio content</HoverCardContent>
              </HoverCard>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Command</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-border-subtle overflow-hidden rounded-xl border">
                  <Command className="max-w-md">
                    <CommandInput placeholder="Search…" />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup heading="Items">
                        <CommandItem>Order #1284</CommandItem>
                        <CommandItem>Order #1285</CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              </CardContent>
            </Card>
          </Section>

          <Section
            id="data"
            title="Data display & feedback"
            description="Table, Badge, Avatar, Skeleton, Progress, Toast."
          >
            <div className="mb-4 flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => toast.success('Success.')}>
                Toast: success
              </Button>
              <Button variant="outline" onClick={() => toast.info('Info.')}>
                Toast: info
              </Button>
              <Button variant="outline" onClick={() => toast.warning('Warning.')}>
                Toast: warning
              </Button>
              <Button variant="destructive" onClick={() => toast.error('Error.')}>
                Toast: error
              </Button>
            </div>
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-ink-muted mb-2 text-sm font-semibold tracking-wider uppercase">
                  Badge
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Primary</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="neutral">Neutral</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="service-new">New</Badge>
                  <Badge variant="service-acknowledged">Acknowledged</Badge>
                  <Badge variant="service-preparing">Preparing</Badge>
                  <Badge variant="service-plating">Plating</Badge>
                  <Badge variant="service-ready">Ready</Badge>
                </div>
              </div>
              <div>
                <h3 className="text-ink-muted mb-2 text-sm font-semibold tracking-wider uppercase">
                  Avatar
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarImage src="data:image/svg+xml;utf8,<svg/>" alt="JD" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                  <Avatar size="sm">
                    <AvatarFallback>CK</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-ink-muted mb-2 text-sm font-semibold tracking-wider uppercase">
                  Progress (determinate)
                </h3>
                <Progress value={64} aria-label="Prep" />
              </div>
              <div>
                <h3 className="text-ink-muted mb-2 text-sm font-semibold tracking-wider uppercase">
                  Progress (indeterminate)
                </h3>
                <Progress
                  aria-label="Syncing"
                  aria-valuetext="Loading"
                  value={null as unknown as number}
                />
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-ink-muted mb-2 text-sm font-semibold tracking-wider uppercase">
                Skeleton
              </h3>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Order</TableHead>
                  <TableHead scope="col">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>#1284</TableCell>
                  <TableCell>
                    <Badge variant="service-preparing">Preparing</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>#1285</TableCell>
                  <TableCell>
                    <Badge variant="service-ready">Ready</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Section>

          <Section
            id="navigation"
            title="Navigation"
            description="Breadcrumb, Pagination, NavigationMenu, Menubar."
          >
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#button">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Showcase</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Pagination className="mb-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>NavigationMenu</CardTitle>
                </CardHeader>
                <CardContent>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>Overview</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[280px] gap-2 p-3">
                            <li>
                              <NavigationMenuLink href="#">Today</NavigationMenuLink>
                            </li>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Menubar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Menubar>
                    <MenubarMenu>
                      <MenubarTrigger>File</MenubarTrigger>
                      <MenubarContent>
                        <MenubarItem>New</MenubarItem>
                      </MenubarContent>
                    </MenubarMenu>
                  </Menubar>
                </CardContent>
              </Card>
            </div>
          </Section>
        </main>
      </div>
    </TooltipProvider>
  );
}
