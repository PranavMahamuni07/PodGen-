import LeftSidebar from "@/components/LeftSidebar";
import MobileNav from "@/components/MobileNav";
import RightSidebar from "@/components/RightSidebar";
import Image from "next/image";
import PodcastPlayer from "@/components/PodcastPlayer";
import { ErrorBoundary } from "react-error-boundary";
import EmptyState from "@/components/EmptyState";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col">
      <main className="relative flex bg-[--primary-color]">
        <LeftSidebar />

        <section className="flex min-h-screen flex-1 flex-col px-4 sm:px-14">
          <div className="mx-auto flex w-full max-w-5xl flex-col max-sm:px-4">
            <div className="flex h-16 items-center justify-between md:hidden">
              <Image
                src="/icons/logo1.svg"
                width={30}
                height={30}
                alt="menu icon"
              />
              <MobileNav />
            </div>
            <ErrorBoundary fallback={
              <div className="flex min-h-screen justify-center items-center">
                <EmptyState title="Not Found" />  
              </div>
            }>
              <div className="flex flex-col md:pb-14">{children}</div>
            </ErrorBoundary>
          </div>
        </section>

        <RightSidebar />
      </main>

      <PodcastPlayer />
    </div>
  );
}
