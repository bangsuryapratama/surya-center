import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="font-display text-4xl font-bold text-sun mb-2">404</p>
      <p className="text-sm text-foreground-muted mb-5">Halaman tidak ditemukan.</p>
      <Button asChild><Link to="/">Kembali ke Beranda</Link></Button>
    </div>
  );
}
