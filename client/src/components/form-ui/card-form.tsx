// React
import { ReactNode } from 'react';
import { useShallow } from 'zustand/shallow';

// External Libraries
import { Loader2 } from 'lucide-react';

// Components
import { AppCard } from '@/components/layout-ui/app-card';


// Utils
import { cn } from '@/lib/utils';

// Stores
import { TFormHandlerStore } from '@/stores';


interface ICardFormProps<TFormData, TResponse> {
  className?: string;
  title: string;
  description?: string;
  footerContent?: ReactNode;
  children: ReactNode;
  formStore: TFormHandlerStore<TFormData, TResponse>;
}

export function CardForm<TFormData, TResponse>({
  className,
  title,
  description,
  footerContent,
  children,
  formStore
}: ICardFormProps<TFormData, TResponse>) {

  const { isSubmitting, error, onSubmit } = formStore(useShallow(state => ({
    onSubmit: state.onSubmit,
    isSubmitting: state.isSubmitting,
    error: state.error
  })));
  return (
    <form onSubmit={onSubmit}>
      <div className={cn('relative', className)}>

        <AppCard
          header={
            <>
              <h2 className="text-2xl font-semibold">{title}</h2>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </>
          }
          footer={footerContent}
        >
          {isSubmitting && (
            <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {children}
          {error && (
            <p className="text-sm font-medium text-red-500 my-2">{error.message}</p>
          )}
        </AppCard>

      </div>
    </form>
  );
}