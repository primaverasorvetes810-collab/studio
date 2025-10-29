import {
  DollarSign,
  Users,
  ShoppingCart,
  Package,
} from "lucide-react";
import PageHeader from "@/components/page-header";
import { AdminStatsCard } from "@/components/admin-stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { orders, type Order } from "@/lib/data/orders";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const chartData = [
  { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "May", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Jul", total: Math.floor(Math.random() * 5000) + 1000 },
];

const statusColors: Record<Order["status"], string> = {
  Pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20",
  Paid: "bg-green-500/20 text-green-500 border-green-500/20",
  Overdue: "bg-red-500/20 text-red-500 border-red-500/20",
  Shipped: "bg-blue-500/20 text-blue-500 border-blue-500/20",
  Delivered: "bg-primary/20 text-primary border-primary/20",
  Canceled: "bg-gray-500/20 text-muted-foreground border-gray-500/20",
};

export default function DashboardPage() {
  const recentOrders = orders.slice(0, 5);
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Dashboard" description="An overview of your store." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatsCard
          title="Total Revenue"
          value={formatPrice(54231.89)}
          icon={DollarSign}
          description="+20.1% from last month"
        />
        <AdminStatsCard
          title="Clients"
          value="+235"
          icon={Users}
          description="+18.1% from last month"
        />
        <AdminStatsCard
          title="Orders"
          value="+12,234"
          icon={ShoppingCart}
          description="+19% from last month"
        />
        <AdminStatsCard
          title="Products in Stock"
          value="573"
          icon={Package}
          description="201 active"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${formatPrice(value as number)}`}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              You made {orders.length} orders this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.id}</div>
                    </TableCell>
                    <TableCell>
                       <Badge className={cn("whitespace-nowrap", statusColors[order.status])} variant="outline">
                         {order.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
