import { API_BASE_URL } from "../../lib/api";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IndianRupee, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface WithdrawalRequest {
    _id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    remarks?: string;
    createdAt: string;
}

export default function WithdrawalPage() {
    const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const { toast } = useToast();

    const fetchWithdrawalHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/instructor/withdrawal/history`, {
                credentials: "include"
            });
            const data = await response.json();
            if (data.success) {
                setWithdrawalHistory(data.withdrawals);
                setTotalEarnings(Number(data.availableBalance) || 0);
            } else {
                throw new Error(data.message || "Failed to load withdrawals");
            }
        } catch (error) {
            console.error("Error fetching withdrawal history:", error);
            toast({ title: "Could not load withdrawals", variant: "destructive" });
        }
    };

    useEffect(() => {
        fetchWithdrawalHistory();
    }, []);

    const handleSubmit = async () => {
        const amountNum = parseFloat(amount);
        if (!amount || amountNum <= 0) {
            toast({
                title: "Invalid amount",
                description: "Please enter a valid amount",
                variant: "destructive"
            });
            return;
        }

        if (amountNum > totalEarnings) {
            toast({
                title: "Invalid amount",
                description: "Withdrawal amount cannot be greater than available balance",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/instructor/withdrawal/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    remarks
                })
            });

            const data = await response.json();
            if (data.success) {
                toast({
                    title: "Success",
                    description: "Withdrawal request submitted successfully"
                });
                setIsDialogOpen(false);
                setAmount("");
                setRemarks("");
                fetchWithdrawalHistory();
            } else {
                toast({
                    title: "Error",
                    description: data.message,
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Error submitting withdrawal request:", error);
            toast({
                title: "Error",
                description: "Failed to submit withdrawal request",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Withdrawals</h1>
                        <p className="text-muted-foreground">Manage your earnings and withdrawal requests</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <IndianRupee className="mr-2 h-4 w-4" />
                                Request Withdrawal
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Request Withdrawal</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Available balance: ₹{totalEarnings.toFixed(2)}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Amount</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Remarks (optional)</label>
                                    <Textarea
                                        placeholder="Add any remarks..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={isLoading}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Request"
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-primary/5 border-none">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <IndianRupee className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                                    <h3 className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-yellow-50 border-none">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-yellow-100 rounded-full">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                                    <h3 className="text-2xl font-bold">
                                        {withdrawalHistory.filter(w => w.status === 'pending').length}
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-green-50 border-none">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Approved Withdrawals</p>
                                    <h3 className="text-2xl font-bold">
                                        ₹{withdrawalHistory
                                            .filter(w => w.status === 'approved')
                                            .reduce((sum, w) => sum + w.amount, 0)
                                            .toFixed(2)}
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-none">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Rejected Requests</p>
                                    <h3 className="text-2xl font-bold">
                                        {withdrawalHistory.filter(w => w.status === 'rejected').length}
                                    </h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Withdrawal History Table */}
                <Card className="border-none">
                    <CardHeader>
                        <CardTitle>Withdrawal History</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            View all your withdrawal requests and their status
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {withdrawalHistory.map((request) => (
                                    <TableRow key={request._id}>
                                        <TableCell className="font-medium">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>₹{request.amount.toFixed(2)}</TableCell>
                                        <TableCell>                                            <Badge 
                                                variant={
                                                    request.status === 'approved' 
                                                        ? "default" 
                                                        : request.status === 'rejected'
                                                        ? "destructive"
                                                        : "secondary"
                                                }
                                                className={`${
                                                    request.status === 'approved'
                                                        ? "bg-green-100 text-green-800"
                                                        : request.status === 'rejected'
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                }`}
                                            >
                                                {request.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {request.remarks || "-"}
                                        </TableCell>
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


