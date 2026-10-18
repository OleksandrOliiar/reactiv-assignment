import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { FieldGroup } from '@/shared/ui/field';
import { Skeleton } from '@/shared/ui/skeleton';

export default function HomeLoading() {
  return (
    <FieldGroup className="mx-auto w-full max-w-3xl px-6 py-10">
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
      </Card>
    </FieldGroup>
  );
}
