import { getEvents } from "@/actions/event-actions";
import EventCard from "@/components/event-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventFilter } from "@/components/event-filter";
import { CategoryNav } from "@/components/category-nav";
import { FeaturesSection } from "@/components/marketing/features";
import { ArrowRight, Ticket } from "lucide-react";

interface HomeProps {
  searchParams: Promise<{
    keyword?: string;
    category?: string;
    page?: string;
    sort?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function Home(props: HomeProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const keyword = searchParams.keyword || "";
  const category = searchParams.category || "";
  const sort = searchParams.sort || "date_asc";

  const { events, pages } = await getEvents({ keyword, category, page, sort });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. HERO SEKCIJA (Tamna pozadina + Tražilica) */}
      <EventFilter />

      {/* 2. GLAVNI SADRŽAJ (Pomaknut gore da se preklapa vizualno) */}
      <div className="container mx-auto px-4 relative z-10">
        {/* KATEGORIJE */}
        <div className="-mt-8 mb-12">
          <CategoryNav />
        </div>

        {/* LISTA DOGAĐAJA */}
        <section className="py-4">
          <div className="flex items-end justify-between mb-8 px-2">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                {keyword
                  ? `Rezultati za: "${keyword}"`
                  : category !== "all" && category
                  ? `Kategorija: ${category}`
                  : "Najnovije u ponudi"}
              </h2>
              <p className="text-slate-500 mt-1">
                Istražite događaje u vašoj blizini
              </p>
            </div>
          </div>

          {!events || events.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-3xl bg-white">
              <div className="bg-slate-50 p-4 rounded-full inline-block shadow-sm mb-4">
                <Ticket className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-lg font-medium text-slate-900">
                Nema pronađenih događaja
              </p>
              <p className="text-slate-500 mt-1 mb-6">
                Pokušajte promijeniti kriterije pretrage.
              </p>
              {(keyword || category) && (
                <Button variant="outline" asChild>
                  <Link href="/">Poništi filtere</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map((event: any) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* PAGINACIJA */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 my-16">
            {page > 1 && (
              <Button variant="outline" asChild className="bg-white">
                <Link
                  href={`/?page=${
                    page - 1
                  }&keyword=${keyword}&category=${category}`}
                >
                  &laquo; Prethodna
                </Link>
              </Button>
            )}
            <span className="flex items-center px-4 text-sm font-medium bg-white border rounded-md shadow-sm">
              {page} / {pages}
            </span>
            {page < pages && (
              <Button variant="outline" asChild className="bg-white">
                <Link
                  href={`/?page=${
                    page + 1
                  }&keyword=${keyword}&category=${category}`}
                >
                  Sljedeća &raquo;
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* MARKETING I BANNER */}
        <FeaturesSection />

        <div className="my-20 bg-[#0f172a] rounded-[2.5rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
            Imate višak ulaznica?
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto relative z-10 text-lg">
            Ne dozvolite da propadnu. Stavite ih na naš Resale Market sigurno i
            jednostavno. Isplata kredita je trenutna.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-transform font-bold text-lg h-14 px-8 relative z-10 rounded-xl"
          >
            <Link href="/my-tickets">
              Prodaj svoje ulaznice <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
