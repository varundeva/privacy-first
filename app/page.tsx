import { Suspense } from 'react';
import { HomeClient } from './home-client';
import Loading from './loading';

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeClient />
    </Suspense>
  );
}
