import { API_BASE_URL } from "../../lib/api";
import { useEffect, useState, useMemo, useCallback } from "react";
import { DollarSign, Users, TrendingUp, Search, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EarningItem {
    courseTitle: string;
    userEmail: string;
    orderStatus: string;
    coursePrice: number | { $numberDecimal: string };
    paymentStatus: string;
    createdAt: string;
}

interface EarningStats {
    totalAmount: number;
    successfulOrders: number;
    pendingAmount: number;
    averageOrderValue: number;
    monthlyGrowth: number;
}

export default function EarningPage() {
    const [earningData, setEarningData] = useState<EarningItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("date");
    const [error, setError] = useState<string | null>(null);

    const getAmount = (amount: EarningItem["coursePrice"]) =>
        typeof amount === "number" ? amount : Number(amount?.$numberDecimal || 0);

    const calculateStats = useCallback((data: EarningItem[]): EarningStats => {
        if (!Array.isArray(data)) {
            return {
                totalAmount: 0,
                successfulOrders: 0,
                pendingAmount: 0,
                averageOrderValue: 0,
                monthlyGrowth: 0
            };
        }

        const successfulPayments = data.filter(item => 
            item && 
            item.orderStatus === "Approved"
        );

        const totalSuccessfulAmount = successfulPayments.reduce((sum, item) => 
            sum + getAmount(item.coursePrice), 0
        );

        const pendingAmount = data.reduce((sum, item) => {
            if (item && item.coursePrice && item.orderStatus === "Pending") {
                return sum + getAmount(item.coursePrice);
            }
            return sum;
        }, 0);

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const currentMonthPayments = successfulPayments.filter(item => 
            new Date(item.createdAt) >= currentMonthStart
        );
        
        const lastMonthPayments = successfulPayments.filter(item => 
            new Date(item.createdAt) >= lastMonthStart && 
            new Date(item.createdAt) < currentMonthStart
        );

        const currentMonthTotal = currentMonthPayments.reduce((sum, item) => 
            sum + getAmount(item.coursePrice), 0
        );

        const lastMonthTotal = lastMonthPayments.reduce((sum, item) => 
            sum + getAmount(item.coursePrice), 0
        );

        const monthlyGrowth = lastMonthTotal === 0 ? 
            (currentMonthTotal > 0 ? 100 : 0) : 
            ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

        return {
            totalAmount: totalSuccessfulAmount,
            successfulOrders: successfulPayments.length,
            pendingAmount: pendingAmount,
            averageOrderValue: successfulPayments.length ? 
                totalSuccessfulAmount / successfulPayments.length : 0,
            monthlyGrowth: monthlyGrowth
        };
    }, []);

    const stats = useMemo(() => calculateStats(earningData), [calculateStats, earningData]);

    const fetchInstructorEarnings = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/instructor/earning/orders`, {
                credentials: "include",
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch earnings');
            }

            const orders = result.orders || [];
            setEarningData(orders);
        } catch (error) {
            console.error("Error fetching earnings:", error);
            setError(error instanceof Error ? error.message : 'Failed to fetch earnings');
            setEarningData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructorEarnings();
    }, []);

    const filteredData = useMemo(() => {
        const filtered = earningData.filter((item: EarningItem) => 
            item.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return [...filtered].sort((a: EarningItem, b: EarningItem) => {
            switch (sortBy) {
                case "amount":
                    return getAmount(b.coursePrice) - getAmount(a.coursePrice);
                case "status":
                    return a.orderStatus.localeCompare(b.orderStatus);
                case "date":
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });
    }, [earningData, searchTerm, sortBy]);

    return (
        <div className="min-h-screen bg-background p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Earnings Dashboard</h1>
                        <p className="text-muted-foreground">Manage your course earnings and withdrawals</p>
                    </div>
                    <Link to="/instructor/withdrawals">
                        <Button className="bg-primary hover:bg-primary/90">
                            <Wallet className="mr-2 h-4 w-4" />
                            Withdraw Funds
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border bg-card">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <DollarSign className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                                    <h3 className="text-2xl font-bold">₹{stats.totalAmount.toFixed(2)}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border bg-card">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Successful Orders</p>
                                    <h3 className="text-2xl font-bold">{stats.successfulOrders}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border bg-card">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 rounded-full bg-muted">
                                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                                    <h3 className="text-2xl font-bold">₹{stats.pendingAmount.toFixed(2)}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border bg-card">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 rounded-full bg-primary/10">
                                    <TrendingUp className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Monthly Growth</p>
                                    <h3 className="text-2xl font-bold">
                                        {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}%
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter */}
                <Card className="border shadow-sm">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by course or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                        <Select defaultValue={sortBy} onValueChange={(value) => setSortBy(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Sort by Date</SelectItem>
                                <SelectItem value="amount">Sort by Amount</SelectItem>
                                <SelectItem value="status">Sort by Status</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Error Message */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Transactions Table */}
                {isLoading ? (
                    <Card className="border">
                        <CardContent className="p-6 flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.courseTitle}</TableCell>
                                            <TableCell>{item.userEmail}</TableCell>
                                            <TableCell>₹{getAmount(item.coursePrice).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={item.orderStatus === "Approved" ? "default" : "secondary"}
                                                    className={
                                                        item.orderStatus === "Approved" 
                                                            ? "bg-success/15 text-success" 
                                                            : "bg-warning/15 text-warning"
                                                    }
                                                >
                                                    {item.orderStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
