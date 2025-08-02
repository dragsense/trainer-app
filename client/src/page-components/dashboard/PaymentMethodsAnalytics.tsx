import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, TrendingUp, MoreHorizontal, Eye, Edit, Trash2, Settings } from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { dashboardApi } from '@/services/dashboard.api';
import { IPaymentMethodsOverview } from '@/@types/dashboard.type';

interface PaymentMethodsAnalyticsProps {
  className?: string;
}

const PaymentMethodsAnalytics: React.FC<PaymentMethodsAnalyticsProps> = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethodsOverview | null>(null);

  const fetchPaymentMethodsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getPaymentMethodsOverview();
      setPaymentMethods(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment methods data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethodsData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading payment methods data...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchPaymentMethodsData}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{paymentMethods?.paymentMethods?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Methods</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{paymentMethods?.paymentMethods?.filter(method => method.isEnabled).length || 0}</p>
              <p className="text-sm text-muted-foreground">Active Methods</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${paymentMethods?.statistics?.reduce((acc, stat) => acc + stat.totalRevenue, 0).toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{paymentMethods?.statistics?.reduce((acc, stat) => acc + stat.usageCount, 0) || 0}</p>
              <p className="text-sm text-muted-foreground">Total Usage</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Methods Distribution</h3>
          {paymentMethods?.statistics && paymentMethods.statistics.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethods.statistics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ paymentMethod, usageCount }) => `${paymentMethod} (${usageCount})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="usageCount"
                  >
                    {paymentMethods.statistics.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No payment method data available
            </div>
          )}
        </Card>

        {/* Usage Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Statistics</h3>
          {paymentMethods?.statistics && paymentMethods.statistics.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethods.statistics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="transactionCount" fill="#8884d8" name="Transactions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No usage statistics available
            </div>
          )}
        </Card>
      </div>

      {/* Payment Methods List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Payment Methods List</h3>
          <Button size="sm">Add Payment Method</Button>
        </div>
        
        {paymentMethods?.paymentMethods && paymentMethods.paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.paymentMethods.map((method) => (
              <Card key={method.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize">{method.name}</p>
                        <Badge className={method.isEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {method.isEnabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Key: {method.key}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        ${paymentMethods.statistics?.find(stat => stat.paymentMethod === method.key)?.totalRevenue.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payment methods found</p>
            <Button className="mt-4" size="sm">Add Your First Payment Method</Button>
          </div>
        )}
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="font-medium mb-2">Enabled Methods</h4>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ 
                  width: `${paymentMethods?.paymentMethods && paymentMethods.paymentMethods.length > 0 
                    ? (paymentMethods.paymentMethods.filter(method => method.isEnabled).length / paymentMethods.paymentMethods.length) * 100
                    : 0}%` 
                }}
              />
            </div>
            <span className="text-sm font-medium">
              {paymentMethods?.paymentMethods && paymentMethods.paymentMethods.length > 0 
                ? ((paymentMethods.paymentMethods.filter(method => method.isEnabled).length / paymentMethods.paymentMethods.length) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
        </Card>
        
        <Card className="p-4">
          <h4 className="font-medium mb-2">Total Usage Count</h4>
          <p className="text-2xl font-bold text-blue-600">{paymentMethods?.statistics?.reduce((acc, stat) => acc + stat.usageCount, 0) || 0}</p>
        </Card>
        
        <Card className="p-4">
          <h4 className="font-medium mb-2">Total Revenue</h4>
          <p className="text-2xl font-bold text-green-600">${paymentMethods?.statistics?.reduce((acc, stat) => acc + stat.totalRevenue, 0).toFixed(2) || '0.00'}</p>
        </Card>
      </div>
    </div>
  );
};

export default PaymentMethodsAnalytics;
