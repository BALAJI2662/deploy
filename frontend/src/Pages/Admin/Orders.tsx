import { API_BASE_URL } from "../../lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/Loading";
import { 
    Search, 
    DollarSign, 
    ShoppingBag, 
    TrendingUp, 
    Download
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface RawOrder {
    _id: string;
    orderStatus: string;
    courseTitle: string;
    userEmail: string;
    coursePrice: {
        $numberDecimal: string;
    };
}

interface Order extends RawOrder {
    createdAt: string;
}

type OrderStatus = "success" | "approval" | "pending" | "failed";
type DateRange = "all" | "today" | "week" | "month";

const isSuccessfulOrder = (status: string): boolean => {
    const normalizedStatus = status.toLowerCase();
    return normalizedStatus === "success" || normalizedStatus === "approval";
};

export default function Orders() {
    const [earningData, setEarningData] = useState<Order[]>([]);
    const [filteredData, setFilteredData] = useState<Order[]>([]);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
    const [dateRange, setDateRange] = useState<DateRange>("all");

    const fetchInstructorEarnings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/courseview/orders`, {
                credentials: "include",
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            
            const data: RawOrder[] = await response.json();
            const ordersWithDates = data.map((order) => ({
                ...order,
                createdAt: new Date(parseInt(order._id.substring(0, 8), 16) * 1000).toISOString()
            }));
            
            const sortedData = ordersWithDates.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            setEarningData(sortedData);
            setFilteredData(sortedData);
            
            const total = data.reduce((sum, item) => {
                const price = parseFloat(item.coursePrice.$numberDecimal);
                return sum + (isNaN(price) ? 0 : price);
            }, 0);
            setTotalAmount(total);
        } catch {
            toast({
                title: "Error",
                description: "Failed to fetch orders. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getSuccessRate = () => {
        if (earningData.length === 0) return 0;
        const successfulOrders = earningData.filter(order => isSuccessfulOrder(order.orderStatus)).length;
        return ((successfulOrders / earningData.length) * 100).toFixed(1);
    };

    const getAverageOrderValue = () => {
        if (earningData.length === 0) return 0;
        return (totalAmount / earningData.length).toFixed(2);
    };

    const downloadOrdersCSV = () => {
        const headers = ["Date", "Status", "Course", "Email", "Amount"];
        const csvContent = [
            headers.join(","),
            ...filteredData.map(order => [
                new Date(order.createdAt).toLocaleDateString(),
                order.orderStatus === "approval" ? "success" : order.orderStatus,
                `"${order.courseTitle}"`,
                order.userEmail,
                parseFloat(order.coursePrice.$numberDecimal).toFixed(2)
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        fetchInstructorEarnings();
    }, []);

    useEffect(() => {
        let filtered = [...earningData];

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(order => {
                if (statusFilter === "success") {
                    return isSuccessfulOrder(order.orderStatus);
                }
                return order.orderStatus.toLowerCase() === statusFilter;
            });
        }

        // Apply date range filter
        const now = new Date();
        if (dateRange === "today") {
            filtered = filtered.filter(order => 
                new Date(order.createdAt).toDateString() === now.toDateString()
            );
        } else if (dateRange === "week") {
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            filtered = filtered.filter(order => 
                new Date(order.createdAt) >= weekAgo
            );
        } else if (dateRange === "month") {
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            filtered = filtered.filter(order => 
                new Date(order.createdAt) >= monthAgo
            );
        }

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(order => 
                order.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.orderStatus.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredData(filtered);
    }, [searchQuery, statusFilter, dateRange, earningData]);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="w-full min-h-full p-4 sm:p-10 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <DollarSign className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                <h3 className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <ShoppingBag className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                                <h3 className="text-2xl font-bold">{earningData.length}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <TrendingUp className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                                <h3 className="text-2xl font-bold">{getSuccessRate()}%</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <DollarSign className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                                <h3 className="text-2xl font-bold">₹{getAverageOrderValue()}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select
                    value={statusFilter}
                    onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="success">Successful</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={dateRange}
                    onValueChange={(value: DateRange) => setDateRange(value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Date range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                </Select>

                <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={downloadOrdersCSV}
                >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">#</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Course Name</TableHead>
                                <TableHead>User Email</TableHead>
                                <TableHead>Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((order, index) => (
                                <TableRow key={order._id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                isSuccessfulOrder(order.orderStatus)
                                                    ? "default" 
                                                    : order.orderStatus === "pending" 
                                                        ? "secondary"
                                                        : "destructive"
                                            }
                                            className="capitalize"
                                        >
                                            {order.orderStatus === "approval" ? "success" : order.orderStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        {order.courseTitle}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {order.userEmail}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        ₹{parseFloat(order.coursePrice.$numberDecimal).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
