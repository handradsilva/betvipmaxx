import Layout from "@/components/Layout";

const Wallet = () => {
  const balance = 0; // TODO: real balance

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Minha Carteira</h1>

        <div className="p-6 rounded-2xl bg-card border border-border mb-6">
          <p className="text-sm text-muted-foreground mb-1">Saldo disponível</p>
          <p className="text-3xl font-bold text-primary">R$ {balance.toFixed(2).replace(".", ",")}</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">Histórico de Transações</h2>
          <div className="text-center py-10">
            <p className="text-muted-foreground text-sm">Nenhuma transação encontrada</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;
