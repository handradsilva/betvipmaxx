import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  startDate: Date;
  endDate: Date;
  onStartChange: (d: Date) => void;
  onEndChange: (d: Date) => void;
}

const AdminDateFilter = ({ startDate, endDate, onStartChange, onEndChange }: Props) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs text-muted-foreground font-medium">Filtro:</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs h-8">
            <CalendarIcon size={12} className="mr-1" />
            {format(startDate, "dd/MM/yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={(d) => d && onStartChange(d)}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      <span className="text-xs text-muted-foreground">até</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs h-8">
            <CalendarIcon size={12} className="mr-1" />
            {format(endDate, "dd/MM/yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={(d) => d && onEndChange(d)}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AdminDateFilter;
