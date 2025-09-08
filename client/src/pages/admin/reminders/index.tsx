import { useQueryClient } from "@tanstack/react-query";


// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { ReminderTable, ReminderViewModal } from "@/components/admin";
import { ReminderForm } from "@/page-components";


// API
import { deleteReminder, fetchReminder, fetchReminders } from "@/services/reminder.api";

// Types
import { IReminder } from "@/@types/reminder.type";


// Layouts
import { PageInnerLayout } from "@/layouts";



export default function RemindersPage() {

  const queryReminder = useQueryClient();

  const STORE_KEY = 'reminder';

  return (
    <PageInnerLayout Header={<Header />}>
      <SingleHandler<IReminder>
        queryFn={fetchReminder}
        deleteFn={deleteReminder}
        storeKey={STORE_KEY}
        onDeleteSuccess={() => queryReminder.invalidateQueries({ queryKey: [STORE_KEY + "-list"] })}
        SingleComponent={ReminderViewModal}
        actionComponents={[
          {
            action: 'createOrUpdate',
            comp: ReminderForm
          },
        ]}
      />

      <ListHandler<IReminder>
        queryFn={fetchReminders}
        ListComponent={ReminderTable}
        storeKey={STORE_KEY}
      />
    </PageInnerLayout>
  );
}



const Header = () => null;
