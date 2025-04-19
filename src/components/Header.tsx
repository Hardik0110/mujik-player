import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Props {
  search: string;
  setSearch: (search: string) => void;
}

const Header = ({ search, setSearch }: Props) => {
  return (
    <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Mujik Player</h1>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search songs..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
