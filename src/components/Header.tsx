
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  search: string;
  setSearch: (search: string) => void;
}

export const Header = ({ search, setSearch }: HeaderProps) => {
  return (
    <header className="bg-primary py-4 px-6 md:px-8 sticky top-0 z-10 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">MelodyStream</h1>
          <div className="h-5 w-5 bg-highlight rounded-full ml-2 animate-pulse-light"></div>
        </div>
        
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Search for songs, artists..."
            className="pl-10 bg-white/10 text-white border-secondary/30 focus-visible:ring-highlight"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
