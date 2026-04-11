import { useState } from "react";

const clientes = [
  { nome: "Joao Carlos Mendes", cpf: "123.456.789-00", tel: "(82) 99999-1234", email: "joao@email.com", end: "Rua das Flores, 123 - Maceio/AL" },
  { nome: "Ana Paula Souza", cpf: "987.654.321-00", tel: "(82) 98888-5678", email: "ana@email.com", end: "Av. Principal, 456 - Arapiraca/AL" },
  { nome: "Roberto Lima", cpf: "111.222.333-44", tel: "(82) 97777-9012", email: "roberto@email.com", end: "Rua do Comercio, 789 - Palmeira/AL" },
];

const tiposDoc = [
  { id: "procuracao", label: "Procuracao", desc: "Outorga de poderes ao advogado" },
  { id: "contrato", label: "Contrato", desc: "Contrato de prestacao de servicos" },
  { id: "peticao", label: "Peticao", desc: "Peca processual para protocolacao" },
];

export default function Documentos() {
  const [step, setStep] = useState(1);
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<typeof clientes[0] | null>(null);
  const [busca, setBusca] = useState("");
  const [objeto, setObjeto] = useState("");
  const [docGerado, setDocGerado] = useState("");
  const [loading, setLoading] = useState(false);

  const clientesFiltrados = clientes.filter(
    (c) => c.nome.toLowerCase().includes(busca.toLowerCase()) || c.cpf.includes(busca)
  );

  const gerarDocumento = async () => {
    if (!clienteSelecionado || !tipoSelecionado) return;
    setLoading(true);
    setDocGerado("");
    const prompt = `Voce e um assistente juridico. Gere um documento completo do tipo "${tipoSelecionado}" para: Nome: ${clienteSelecionado.nome}, CPF: ${clienteSelecionado.cpf}, Endereco: ${clienteSelecionado.end}, Telefone: ${clienteSelecionado.tel}, Email: ${clienteSelecionado.email}, Objeto: ${objeto || "A ser definido"}. Gere o documento juridico completo e formal.`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const texto = data.content?.map((b: any) => b.text || "").join("\n") || "";
      setDocGerado(texto);
    } catch (err) {
      setDocGerado("Erro ao gerar documento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Documentos</h1>

      <div className="flex items-center gap-2 mb-8 text-sm">
        {["Tipo", "Cliente", "Revisar e Gerar"].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border ${step === i + 1 ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-400"}`}>{i + 1}</span>
            <span className={step === i + 1 ? "text-blue-600 font-medium" : "text-gray-400"}>{label}</span>
            {i < 2 && <span className="text-gray-300 mx-1">--</span>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Tipo de documento</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {tiposDoc.map((t) => (
              <div key={t.id} onClick={() => setTipoSelecionado(t.id)} className={`border rounded-xl p-4 cursor-pointer ${tipoSelecionado === t.id ? "border-blue-600 border-2" : "border-gray-200"}`}>
                <div className="font-medium text-sm mb-1">{t.label}</div>
                <div className="text-xs text-gray-500">{t.desc}</div>
              </div>
            ))}
          </div>
          <button disabled={!tipoSelecionado} onClick={() => setStep(2)} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-40">Proximo</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Selecionar cliente</p>
          <input type="text" placeholder="Buscar por nome ou CPF..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3" />
          <div className="space-y-2 mb-6">
            {clientesFiltrados.map((c) => (
              <div key={c.cpf} onClick={() => setClienteSelecionado(c)} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${clienteSelecionado?.cpf === c.cpf ? "border-blue-600 border-2" : "border-gray-200"}`}>
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">
                  {c.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium">{c.nome}</div>
                  <div className="text-xs text-gray-500">CPF: {c.cpf}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="px-5 py-2 border border-gray-200 rounded-lg text-sm">Voltar</button>
            <button disabled={!clienteSelecionado} onClick={() => setStep(3)} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-40">Proximo</button>
          </div>
        </div>
      )}

      {step === 3 && clienteSelecionado && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Revisar dados</p>
          <div className="border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Nome", val: clienteSelecionado.nome },
                { label: "CPF", val: clienteSelecionado.cpf },
                { label: "Telefone", val: clienteSelecionado.tel },
                { label: "Email", val: clienteSelecionado.email },
              ].map((f) => (
                <div key={f.label}>
                  <div className="text-xs text-gray-500 mb-1">{f.label}</div>
                  <div className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">{f.val}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Endereco</div>
              <div className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">{clienteSelecionado.end}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Objeto / Finalidade</div>
              <textarea value={objeto} onChange={(e) => setObjeto(e.target.value)} placeholder="Descreva o objeto..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" rows={3} />
            </div>
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setStep(2)} className="px-5 py-2 border border-gray-200 rounded-lg text-sm">Voltar</button>
            <button onClick={gerarDocumento} disabled={loading} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-60">
              {loading ? "Gerando..." : "Gerar documento"}
            </button>
          </div>
          {docGerado && (
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Documento gerado</span>
                <button onClick={() => navigator.clipboard.writeText(docGerado)} className="text-xs text-blue-600 border border-blue-200 px-3 py-1 rounded-lg">Copiar</button>
              </div>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{docGerado}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
