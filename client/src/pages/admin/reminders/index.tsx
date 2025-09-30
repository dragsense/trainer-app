import { useQueryClient } from "@tanstack/react-query";


// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { ReminderList, ReminderViewModal } from "@/components/admin";
import { ReminderForm } from "@/page-components";


// API
import { deleteReminder, fetchReminder, fetchReminders } from "@/services/reminder.api";

// Types
import { IReminder } from "@shared/interfaces/reminder.interface";


// Layouts
import { PageInnerLayout } from "@/layouts";



export default function RemindersPage() {

  const queryReminder = useQueryClient();

  const STORE_KEY = 'reminder';

  return (
    <PageInnerLayout Header={<Header />}>
      <SingleHandler<IReminder, any>
        queryFn={fetchReminder}
        deleteFn={deleteReminder}
        storeKey={STORE_KEY}
        onDeleteSuccess={() => queryReminder.invalidateQueries({ queryKey: [STORE_KEY + "-list"] })}
        SingleComponent={({ storeKey, store }) => <ReminderViewModal storeKey={storeKey} store={store} />}
        actionComponents={[
          {
            action: 'createOrUpdate',
            comp: ReminderForm
          },
        ]}
      />

      <ListHandler<IReminder, any>
        queryFn={fetchReminders}
        ListComponent={ReminderList}
        storeKey={STORE_KEY}
      />
    </PageInnerLayout>
  );
}



const Header = () => null;
