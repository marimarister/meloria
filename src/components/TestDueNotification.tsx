import { AlertTriangle, Bell, Clock, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { addMonths, isBefore, differenceInDays, format } from "date-fns";
import { useState } from "react";

interface TestStatus {
  completed: boolean;
  lastTaken: string | null;
  name: string;
}

interface TestDueNotificationProps {
  tests: TestStatus[];
}

export const TestDueNotification = ({ tests }: TestDueNotificationProps) => {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState<string[]>([]);

  const getTestNotifications = () => {
    const notifications: { type: 'overdue' | 'dueSoon'; testName: string; dueDate: Date; daysUntilDue: number }[] = [];

    tests.forEach((test) => {
      if (test.completed && test.lastTaken) {
        const nextDue = addMonths(new Date(test.lastTaken), 1);
        const now = new Date();
        const daysUntilDue = differenceInDays(nextDue, now);

        if (isBefore(nextDue, now)) {
          // Overdue
          notifications.push({
            type: 'overdue',
            testName: test.name,
            dueDate: nextDue,
            daysUntilDue: daysUntilDue
          });
        } else if (daysUntilDue <= 7) {
          // Due within 7 days
          notifications.push({
            type: 'dueSoon',
            testName: test.name,
            dueDate: nextDue,
            daysUntilDue: daysUntilDue
          });
        }
      }
    });

    return notifications.filter(n => !dismissed.includes(n.testName));
  };

  const notifications = getTestNotifications();

  if (notifications.length === 0) return null;

  const overdueTests = notifications.filter(n => n.type === 'overdue');
  const dueSoonTests = notifications.filter(n => n.type === 'dueSoon');

  return (
    <div className="space-y-3 mb-6 animate-fade-in">
      {overdueTests.length > 0 && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span>{t('employee.notifications.overdueTitle')}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setDismissed(prev => [...prev, ...overdueTests.map(t => t.testName)])}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {overdueTests.map((test, idx) => (
                <li key={idx} className="text-sm">
                  <strong>{test.testName}</strong> - {t('employee.notifications.wasdue')} {format(test.dueDate, 'PPP')} ({Math.abs(test.daysUntilDue)} {t('employee.notifications.daysAgo')})
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {dueSoonTests.length > 0 && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertTitle className="flex items-center justify-between text-amber-800">
            <span>{t('employee.notifications.dueSoonTitle')}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setDismissed(prev => [...prev, ...dueSoonTests.map(t => t.testName)])}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            <ul className="mt-2 space-y-1">
              {dueSoonTests.map((test, idx) => (
                <li key={idx} className="text-sm">
                  <strong>{test.testName}</strong> - {t('employee.notifications.dueIn')} {test.daysUntilDue} {test.daysUntilDue === 1 ? t('employee.notifications.day') : t('employee.notifications.days')} ({format(test.dueDate, 'PPP')})
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
