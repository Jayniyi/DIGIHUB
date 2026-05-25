import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface Invoice {
  id: string;
  project: string;
  amount: string;
  amountNum: number;
  date: string;
  due: string;
  status: string;
  items: { description: string; qty: number; rate: number; total: number }[];
}

const mockInvoices: Invoice[] = [
  { id: "INV-001", project: "Website Redesign", amount: "₦350,000", amountNum: 350000, date: "2026-02-20", due: "2026-03-05", status: "Paid", items: [{ description: "UI/UX Design", qty: 1, rate: 150000, total: 150000 }, { description: "Frontend Development", qty: 1, rate: 200000, total: 200000 }] },
  { id: "INV-002", project: "Instagram Ad Campaign", amount: "₦120,000", amountNum: 120000, date: "2026-02-18", due: "2026-03-01", status: "Pending", items: [{ description: "Ad Creative Design", qty: 1, rate: 40000, total: 40000 }, { description: "Campaign Management (30 days)", qty: 1, rate: 80000, total: 80000 }] },
  { id: "INV-003", project: "Brand Logo Design", amount: "₦80,000", amountNum: 80000, date: "2026-02-10", due: "2026-02-25", status: "Paid", items: [{ description: "Logo Design (3 concepts)", qty: 1, rate: 60000, total: 60000 }, { description: "Brand Guidelines Document", qty: 1, rate: 20000, total: 20000 }] },
  { id: "INV-004", project: "Google Business Setup", amount: "₦45,000", amountNum: 45000, date: "2026-02-22", due: "2026-03-08", status: "Overdue", items: [{ description: "Google Business Profile Setup", qty: 1, rate: 25000, total: 25000 }, { description: "SEO Optimization", qty: 1, rate: 20000, total: 20000 }] },
  { id: "INV-005", project: "Social Media Flyers", amount: "₦60,000", amountNum: 60000, date: "2026-02-24", due: "2026-03-10", status: "Draft", items: [{ description: "Flyer Design (10 pcs)", qty: 10, rate: 6000, total: 60000 }] },
];

const statusColor: Record<string, string> = {
  Paid: "bg-success/15 text-success border-success/30",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Overdue: "bg-destructive/15 text-destructive border-destructive/30",
  Draft: "bg-muted text-muted-foreground border-border",
};

const ClientInvoices = () => {
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const downloadPDF = (inv: Invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 50, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("DigiProHub", 20, 25);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Digital Marketing & Web Solutions", 20, 33);
    doc.text("Lagos, Nigeria | hello@digiprohub.ng", 20, 40);

    // Invoice badge
    doc.setTextColor(245, 166, 35);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - 20, 25, { align: "right" });
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(11);
    doc.text(inv.id, pageWidth - 20, 33, { align: "right" });

    // Body
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text("John Doe", 20, 73);
    doc.text("johndoe@email.com", 20, 80);

    doc.setFont("helvetica", "bold");
    doc.text("Project:", pageWidth - 80, 65);
    doc.setFont("helvetica", "normal");
    doc.text(inv.project, pageWidth - 80, 73);
    doc.text(`Date: ${inv.date}`, pageWidth - 80, 80);
    doc.text(`Due: ${inv.due}`, pageWidth - 80, 87);

    // Table header
    const startY = 105;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, startY - 6, pageWidth - 40, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Description", 25, startY);
    doc.text("Qty", 120, startY, { align: "center" });
    doc.text("Rate (₦)", 148, startY, { align: "right" });
    doc.text("Total (₦)", pageWidth - 25, startY, { align: "right" });

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    let y = startY + 12;
    inv.items.forEach(item => {
      doc.text(item.description, 25, y);
      doc.text(String(item.qty), 120, y, { align: "center" });
      doc.text(item.rate.toLocaleString(), 148, y, { align: "right" });
      doc.text(item.total.toLocaleString(), pageWidth - 25, y, { align: "right" });
      y += 10;
    });

    // Total
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y + 2, pageWidth - 20, y + 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total:", 120, y + 14);
    doc.setTextColor(245, 166, 35);
    doc.text(`₦${inv.amountNum.toLocaleString()}`, pageWidth - 25, y + 14, { align: "right" });

    // Status badge
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Status: ${inv.status}`, 25, y + 14);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Thank you for your business! | DigiProHub © 2026", pageWidth / 2, 280, { align: "center" });

    doc.save(`${inv.id}-${inv.project.replace(/\s+/g, '-')}.pdf`);
    toast({ title: "Invoice Downloaded", description: `${inv.id} saved as PDF.` });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="client" />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage your billing history.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Total Billed</p>
            <p className="text-2xl font-heading font-bold text-card-foreground mt-1">₦655,000</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Paid</p>
            <p className="text-2xl font-heading font-bold text-success mt-1">₦430,000</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-heading font-bold text-destructive mt-1">₦225,000</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-heading font-semibold text-lg text-card-foreground">All Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Invoice</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Project</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden md:table-cell">Date</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden md:table-cell">Due</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockInvoices.map(inv => (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-card-foreground">{inv.id}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{inv.project}</td>
                    <td className="px-5 py-4 text-sm font-medium text-card-foreground">{inv.amount}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground hidden md:table-cell">{inv.date}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground hidden md:table-cell">{inv.due}</td>
                    <td className="px-5 py-4"><Badge variant="outline" className={statusColor[inv.status]}>{inv.status}</Badge></td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setViewInvoice(inv)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => downloadPDF(inv)}><Download className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-secondary" /> {viewInvoice?.id}
              </DialogTitle>
            </DialogHeader>
            {viewInvoice && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">{viewInvoice.project}</p>
                    <p className="text-sm text-muted-foreground">Billed to: John Doe</p>
                  </div>
                  <Badge variant="outline" className={statusColor[viewInvoice.status]}>{viewInvoice.status}</Badge>
                </div>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted/50"><th className="text-left p-3 text-muted-foreground font-medium">Item</th><th className="text-right p-3 text-muted-foreground font-medium">Total</th></tr></thead>
                    <tbody>
                      {viewInvoice.items.map((item, i) => (
                        <tr key={i} className="border-t border-border"><td className="p-3 text-foreground">{item.description}</td><td className="p-3 text-right text-foreground">₦{item.total.toLocaleString()}</td></tr>
                      ))}
                    </tbody>
                    <tfoot><tr className="border-t border-border bg-muted/30"><td className="p-3 font-semibold text-foreground">Total</td><td className="p-3 text-right font-bold text-secondary">₦{viewInvoice.amountNum.toLocaleString()}</td></tr></tfoot>
                  </table>
                </div>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>Issued: {viewInvoice.date}</span><span>•</span><span>Due: {viewInvoice.due}</span>
                </div>
                <Button className="w-full gap-2" onClick={() => downloadPDF(viewInvoice)}><Download className="w-4 h-4" /> Download PDF</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ClientInvoices;
