import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardBolten() {
  const [opportunities, setOpportunities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuração Supabase
  const SUPABASE_URL = 'https://feznqwdgyzveywmuzzmy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oVuV5-yszCkkY_bsh4b74w_ygfhh_YvLfJHDPMjILdNYAz8jjQQUVYEaGpdBMiZvCnNYdYfH';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch opportunities
        const oppRes = await fetch(
          `${SUPABASE_URL}/rest/v1/opportunities?select=*`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          }
        );
        const oppData = await oppRes.json();
        setOpportunities(oppData || []);

        // Fetch contacts
        const contactRes = await fetch(
          `${SUPABASE_URL}/rest/v1/contacts?select=*`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          }
        );
        const contactData = await contactRes.json();
        setContacts(contactData || []);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Processamento de dados
  const totalOpp = opportunities.length;
  const wonOpp = opportunities.filter(o => o.status === 'Done' || o.status === 'Ganho').length;
  const lostOpp = opportunities.filter(o => o.status === 'Perdido').length;
  const totalValue = opportunities.reduce((sum, o) => sum + (parseFloat(o.value) || 0), 0);
  const totalContacts = contacts.length;

  const oppByStatus = [
    { name: 'Ganhas', value: wonOpp, fill: '#10B981' },
    { name: 'Perdidas', value: lostOpp, fill: '#EF4444' },
    { name: 'Em progresso', value: totalOpp - wonOpp - lostOpp, fill: '#F59E0B' }
  ];

  const timelineData = opportunities
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-7)
    .map((o, i) => ({
      name: `Opp ${i + 1}`,
      value: parseFloat(o.value) || 0,
      status: o.status
    }));

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando dados...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600, marginBottom: '0.5rem' }}>Dashboard Bolten</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Acompanhe seus resultados em tempo real</p>
      </div>

      {/* Cards de Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '2rem' }}>
        <div style={{ background: '#F0F9FF', padding: '1.5rem', borderRadius: '8px', border: '1px solid #E0F2FE' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#0369A1', fontWeight: 500 }}>Total de Oportunidades</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 600, color: '#0369A1' }}>{totalOpp}</p>
        </div>
        <div style={{ background: '#ECFDF5', padding: '1.5rem', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#047857', fontWeight: 500 }}>Ganhas</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 600, color: '#047857' }}>{wonOpp}</p>
        </div>
        <div style={{ background: '#FEF2F2', padding: '1.5rem', borderRadius: '8px', border: '1px solid #FEE2E2' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#991B1B', fontWeight: 500 }}>Perdidas</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 600, color: '#991B1B' }}>{lostOpp}</p>
        </div>
        <div style={{ background: '#FEF3C7', padding: '1.5rem', borderRadius: '8px', border: '1px solid #FCD34D' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#92400E', fontWeight: 500 }}>Valor Total</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 600, color: '#92400E' }}>R$ {totalValue.toFixed(0)}</p>
        </div>
        <div style={{ background: '#F3E8FF', padding: '1.5rem', borderRadius: '8px', border: '1px solid #E9D5FF' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#6B21A8', fontWeight: 500 }}>Total de Contatos</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 600, color: '#6B21A8' }}>{totalContacts}</p>
        </div>
        <div style={{ background: '#F5F3FF', padding: '1.5rem', borderRadius: '8px', border: '1px solid #EDE9FE' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '12px', color: '#5B21B6', fontWeight: 500 }}>Taxa de Conversão</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 600, color: '#5B21B6' }}>{totalOpp > 0 ? Math.round((wonOpp / totalOpp) * 100) : 0}%</p>
        </div>
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Funil - Pie Chart */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '16px', fontWeight: 600 }}>Oportunidades por Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={oppByStatus} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                {oppByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '16px', fontWeight: 600 }}>Últimas Oportunidades (Valor)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toFixed(0)}`} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Oportunidades */}
      <div style={{ marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '16px', fontWeight: 600 }}>Oportunidades Recentes</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, color: '#374151' }}>Nome</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, color: '#374151' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 600, color: '#374151' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 600, color: '#374151' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.slice(-5).reverse().map((opp, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px', color: '#111827' }}>{opp.name || '-'}</td>
                  <td style={{ padding: '12px', color: '#6B7280', fontSize: '13px' }}>{opp.email || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: opp.status === 'Done' || opp.status === 'Ganho' ? '#DCFCE7' : opp.status === 'Perdido' ? '#FEE2E2' : '#FEF3C7',
                      color: opp.status === 'Done' || opp.status === 'Ganho' ? '#047857' : opp.status === 'Perdido' ? '#991B1B' : '#92400E'
                    }}>
                      {opp.status || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#111827', fontWeight: 500 }}>R$ {(parseFloat(opp.value) || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', border: '1px solid #FECACA' }}>
          Erro ao carregar dados: {error}
        </div>
      )}

      <div style={{ marginTop: '2rem', fontSize: '12px', color: '#9CA3AF', textAlign: 'center' }}>
        Dashboard atualizado automaticamente a cada 30 segundos
      </div>
    </div>
  );
}
