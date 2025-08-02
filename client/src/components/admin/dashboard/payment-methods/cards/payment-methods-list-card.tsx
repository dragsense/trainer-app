import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, MoreHorizontal, Eye, Edit, Trash2, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { IPaymentMethodsOverview } from '@/@types/dashboard.type';

interface IPaymentMethodsListCardProps {
  data: IPaymentMethodsOverview;
  loading?: boolean;
}

export const PaymentMethodsListCard: React.FC<IPaymentMethodsListCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <AppCard className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </AppCard>
    );
  }

  if (!data?.paymentMethods || data.paymentMethods.length === 0) {
    return (
      <AppCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Payment Methods List</h3>
          <Button size="sm">Add Payment Method</Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No payment methods found</p>
          <Button className="mt-4" size="sm">Add Your First Payment Method</Button>
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Payment Methods List</h3>
        <Button size="sm">Add Payment Method</Button>
      </div>
      
      <div className="space-y-3">
        {data.paymentMethods.map((method) => (
          <AppCard key={method.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium capitalize">{method.name}</p>
                    <Badge variant={method.isEnabled ? "default" : "secondary"}>
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
                    ${data.statistics?.find(stat => stat.paymentMethod === method.key)?.totalRevenue.toFixed(2) || '0.00'}
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
          </AppCard>
        ))}
      </div>
    </AppCard>
  );
};
