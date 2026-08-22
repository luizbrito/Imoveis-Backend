import { Hono } from 'hono';
import { appContextForMcp } from '../../shared/controller/appContext';
import { Error400 } from '../../shared/errors/Error400';
import { Error401 } from '../../shared/errors/Error401';
import { Error403 } from '../../shared/errors/Error403';
import { Error404 } from '../../shared/errors/Error404';
import { getAuditLogMcpTools } from '../auditLog/auditLogMcp';
import { authBackend } from '../auth/authBackend';
import { authGuardBackend } from '../auth/authGuardBackend';
import { getMemberMcpTools } from '../member/memberMcp';
import { getSubscriptionMcpTools } from '../subscription/subscriptionMcp';
import { getUserMcpTools } from '../user/userMcp';
import { getFilialMcpTools } from '../filial/filialMcp';
import { getCorretorMcpTools } from '../corretor/corretorMcp';
import { getProprietarioMcpTools } from '../proprietario/proprietarioMcp';
import { getClienteMcpTools } from '../cliente/clienteMcp';
import { getCondominioMcpTools } from '../condominio/condominioMcp';
import { getEmpreendimentoMcpTools } from '../empreendimento/empreendimentoMcp';
import { getImovelMcpTools } from '../imovel/imovelMcp';
import { getCaracteristicaImovelMcpTools } from '../caracteristicaImovel/caracteristicaImovelMcp';
import { getImovelCaracteristicaMcpTools } from '../imovelCaracteristica/imovelCaracteristicaMcp';
import { getMidiaImovelMcpTools } from '../midiaImovel/midiaImovelMcp';
import { getDocumentoImovelMcpTools } from '../documentoImovel/documentoImovelMcp';
import { getCaptacaoImovelMcpTools } from '../captacaoImovel/captacaoImovelMcp';
import { getAvaliacaoImovelMcpTools } from '../avaliacaoImovel/avaliacaoImovelMcp';
import { getChaveImovelMcpTools } from '../chaveImovel/chaveImovelMcp';
import { getVistoriaMcpTools } from '../vistoria/vistoriaMcp';
import { getItemVistoriaMcpTools } from '../itemVistoria/itemVistoriaMcp';
import { getAnuncioMcpTools } from '../anuncio/anuncioMcp';
import { getPortalImobiliarioMcpTools } from '../portalImobiliario/portalImobiliarioMcp';
import { getPublicacaoPortalMcpTools } from '../publicacaoPortal/publicacaoPortalMcp';
import { getCampanhaMarketingMcpTools } from '../campanhaMarketing/campanhaMarketingMcp';
import { getCampanhaAnuncioMcpTools } from '../campanhaAnuncio/campanhaAnuncioMcp';
import { getLeadMcpTools } from '../lead/leadMcp';
import { getInteracaoLeadMcpTools } from '../interacaoLead/interacaoLeadMcp';
import { getTarefaComercialMcpTools } from '../tarefaComercial/tarefaComercialMcp';
import { getVisitaMcpTools } from '../visita/visitaMcp';
import { getPropostaMcpTools } from '../proposta/propostaMcp';
import { getCondicaoPropostaMcpTools } from '../condicaoProposta/condicaoPropostaMcp';
import { getReservaImovelMcpTools } from '../reservaImovel/reservaImovelMcp';
import { getVendaMcpTools } from '../venda/vendaMcp';
import { getContratoVendaMcpTools } from '../contratoVenda/contratoVendaMcp';
import { getParcelaVendaMcpTools } from '../parcelaVenda/parcelaVendaMcp';
import { getLocacaoMcpTools } from '../locacao/locacaoMcp';
import { getParticipanteLocacaoMcpTools } from '../participanteLocacao/participanteLocacaoMcp';
import { getGarantiaLocacaoMcpTools } from '../garantiaLocacao/garantiaLocacaoMcp';
import { getContratoLocacaoMcpTools } from '../contratoLocacao/contratoLocacaoMcp';
import { getCobrancaLocacaoMcpTools } from '../cobrancaLocacao/cobrancaLocacaoMcp';
import { getPagamentoLocacaoMcpTools } from '../pagamentoLocacao/pagamentoLocacaoMcp';
import { getReajusteLocacaoMcpTools } from '../reajusteLocacao/reajusteLocacaoMcp';
import { getRepasseProprietarioMcpTools } from '../repasseProprietario/repasseProprietarioMcp';
import { getComissaoMcpTools } from '../comissao/comissaoMcp';
import { getPagamentoComissaoMcpTools } from '../pagamentoComissao/pagamentoComissaoMcp';
import { getFornecedorMcpTools } from '../fornecedor/fornecedorMcp';
import { getSolicitacaoManutencaoMcpTools } from '../solicitacaoManutencao/solicitacaoManutencaoMcp';
import { getOrdemServicoMcpTools } from '../ordemServico/ordemServicoMcp';
import { getDespesaImovelMcpTools } from '../despesaImovel/despesaImovelMcp';
import { getContaFinanceiraMcpTools } from '../contaFinanceira/contaFinanceiraMcp';
import { getCategoriaFinanceiraMcpTools } from '../categoriaFinanceira/categoriaFinanceiraMcp';
import { getLancamentoFinanceiroMcpTools } from '../lancamentoFinanceiro/lancamentoFinanceiroMcp';
import { getDocumentoPessoaMcpTools } from '../documentoPessoa/documentoPessoaMcp';
import { getConsentimentoLGPDMcpTools } from '../consentimentoLGPD/consentimentoLGPDMcp';
import { getFavoritoClienteMcpTools } from '../favoritoCliente/favoritoClienteMcp';
import { getSolicitacaoContatoMcpTools } from '../solicitacaoContato/solicitacaoContatoMcp';
import { getSimulacaoFinanciamentoMcpTools } from '../simulacaoFinanciamento/simulacaoFinanciamentoMcp';
import { getContratoAdministracaoMcpTools } from '../contratoAdministracao/contratoAdministracaoMcp';
import { getSeguroImovelMcpTools } from '../seguroImovel/seguroImovelMcp';
import { getOcorrenciaImovelMcpTools } from '../ocorrenciaImovel/ocorrenciaImovelMcp';
import { getArquivoKmlMcpTools } from '../arquivoKml/arquivoKmlMcp';
import { getDocumentacaoRuralBrasilMcpTools } from '../documentacaoRuralBrasil/documentacaoRuralBrasilMcp';
import { getReferenciaClimaticaRuralMcpTools } from '../referenciaClimaticaRural/referenciaClimaticaRuralMcp';
import { getTipoSoloMcpTools } from '../tipoSolo/tipoSoloMcp';
import { getSoloImovelRuralMcpTools } from '../soloImovelRural/soloImovelRuralMcp';
import { getTopografiaRuralMcpTools } from '../topografiaRural/topografiaRuralMcp';
import { getRecursoHidricoRuralMcpTools } from '../recursoHidricoRural/recursoHidricoRuralMcp';
import { getInfraestruturaEnergiaConectividadeMcpTools } from '../infraestruturaEnergiaConectividade/infraestruturaEnergiaConectividadeMcp';
import { getLogisticaRuralMcpTools } from '../logisticaRural/logisticaRuralMcp';
import { getPistaAviacaoRuralMcpTools } from '../pistaAviacaoRural/pistaAviacaoRuralMcp';
import { getBenfeitoriaRuralMcpTools } from '../benfeitoriaRural/benfeitoriaRuralMcp';
import { getDivisaoOperacionalRuralMcpTools } from '../divisaoOperacionalRural/divisaoOperacionalRuralMcp';
import { getProducaoHistoricaRuralMcpTools } from '../producaoHistoricaRural/producaoHistoricaRuralMcp';
import { getSistemaProdutivoRuralMcpTools } from '../sistemaProdutivoRural/sistemaProdutivoRuralMcp';
import { getAtivoIncluidoVendaRuralMcpTools } from '../ativoIncluidoVendaRural/ativoIncluidoVendaRuralMcp';
import { getRestricaoTerritorialRuralMcpTools } from '../restricaoTerritorialRural/restricaoTerritorialRuralMcp';
import { getRiscoRuralMcpTools } from '../riscoRural/riscoRuralMcp';
import { getCertificacaoSustentabilidadeRuralMcpTools } from '../certificacaoSustentabilidadeRural/certificacaoSustentabilidadeRuralMcp';
import { getCondicaoComercialRuralMcpTools } from '../condicaoComercialRural/condicaoComercialRuralMcp';
import { getDueDiligenceRuralMcpTools } from '../dueDiligenceRural/dueDiligenceRuralMcp';
import { getPaisMcpTools } from '../pais/paisMcp';
import { getEstadoMcpTools } from '../estado/estadoMcp';
import { getCidadeMcpTools } from '../cidade/cidadeMcp';
import { McpTool } from './mcpTypes';
import { Dictionary } from '../../translation/locales';
import { env } from '../../env';

const app = new Hono();

// Centralized function to ensure consistency across MCP server and chatbot
export function getAllMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    ...getFilialMcpTools(dictionary),
    ...getCorretorMcpTools(dictionary),
    ...getProprietarioMcpTools(dictionary),
    ...getClienteMcpTools(dictionary),
    ...getCondominioMcpTools(dictionary),
    ...getEmpreendimentoMcpTools(dictionary),
    ...getImovelMcpTools(dictionary),
    ...getCaracteristicaImovelMcpTools(dictionary),
    ...getImovelCaracteristicaMcpTools(dictionary),
    ...getMidiaImovelMcpTools(dictionary),
    ...getDocumentoImovelMcpTools(dictionary),
    ...getCaptacaoImovelMcpTools(dictionary),
    ...getAvaliacaoImovelMcpTools(dictionary),
    ...getChaveImovelMcpTools(dictionary),
    ...getVistoriaMcpTools(dictionary),
    ...getItemVistoriaMcpTools(dictionary),
    ...getAnuncioMcpTools(dictionary),
    ...getPortalImobiliarioMcpTools(dictionary),
    ...getPublicacaoPortalMcpTools(dictionary),
    ...getCampanhaMarketingMcpTools(dictionary),
    ...getCampanhaAnuncioMcpTools(dictionary),
    ...getLeadMcpTools(dictionary),
    ...getInteracaoLeadMcpTools(dictionary),
    ...getTarefaComercialMcpTools(dictionary),
    ...getVisitaMcpTools(dictionary),
    ...getPropostaMcpTools(dictionary),
    ...getCondicaoPropostaMcpTools(dictionary),
    ...getReservaImovelMcpTools(dictionary),
    ...getVendaMcpTools(dictionary),
    ...getContratoVendaMcpTools(dictionary),
    ...getParcelaVendaMcpTools(dictionary),
    ...getLocacaoMcpTools(dictionary),
    ...getParticipanteLocacaoMcpTools(dictionary),
    ...getGarantiaLocacaoMcpTools(dictionary),
    ...getContratoLocacaoMcpTools(dictionary),
    ...getCobrancaLocacaoMcpTools(dictionary),
    ...getPagamentoLocacaoMcpTools(dictionary),
    ...getReajusteLocacaoMcpTools(dictionary),
    ...getRepasseProprietarioMcpTools(dictionary),
    ...getComissaoMcpTools(dictionary),
    ...getPagamentoComissaoMcpTools(dictionary),
    ...getFornecedorMcpTools(dictionary),
    ...getSolicitacaoManutencaoMcpTools(dictionary),
    ...getOrdemServicoMcpTools(dictionary),
    ...getDespesaImovelMcpTools(dictionary),
    ...getContaFinanceiraMcpTools(dictionary),
    ...getCategoriaFinanceiraMcpTools(dictionary),
    ...getLancamentoFinanceiroMcpTools(dictionary),
    ...getDocumentoPessoaMcpTools(dictionary),
    ...getConsentimentoLGPDMcpTools(dictionary),
    ...getFavoritoClienteMcpTools(dictionary),
    ...getSolicitacaoContatoMcpTools(dictionary),
    ...getSimulacaoFinanciamentoMcpTools(dictionary),
    ...getContratoAdministracaoMcpTools(dictionary),
    ...getSeguroImovelMcpTools(dictionary),
    ...getOcorrenciaImovelMcpTools(dictionary),
    ...getArquivoKmlMcpTools(dictionary),
    ...getDocumentacaoRuralBrasilMcpTools(dictionary),
    ...getReferenciaClimaticaRuralMcpTools(dictionary),
    ...getTipoSoloMcpTools(dictionary),
    ...getSoloImovelRuralMcpTools(dictionary),
    ...getTopografiaRuralMcpTools(dictionary),
    ...getRecursoHidricoRuralMcpTools(dictionary),
    ...getInfraestruturaEnergiaConectividadeMcpTools(dictionary),
    ...getLogisticaRuralMcpTools(dictionary),
    ...getPistaAviacaoRuralMcpTools(dictionary),
    ...getBenfeitoriaRuralMcpTools(dictionary),
    ...getDivisaoOperacionalRuralMcpTools(dictionary),
    ...getProducaoHistoricaRuralMcpTools(dictionary),
    ...getSistemaProdutivoRuralMcpTools(dictionary),
    ...getAtivoIncluidoVendaRuralMcpTools(dictionary),
    ...getRestricaoTerritorialRuralMcpTools(dictionary),
    ...getRiscoRuralMcpTools(dictionary),
    ...getCertificacaoSustentabilidadeRuralMcpTools(dictionary),
    ...getCondicaoComercialRuralMcpTools(dictionary),
    ...getDueDiligenceRuralMcpTools(dictionary),
    ...getPaisMcpTools(dictionary),
    ...getEstadoMcpTools(dictionary),
    ...getCidadeMcpTools(dictionary),
    ...getMemberMcpTools(dictionary),
    ...getAuditLogMcpTools(dictionary),
    ...getSubscriptionMcpTools(dictionary),
    ...getUserMcpTools(dictionary),
  ];
}

// Maps HTTP error codes to JSON-RPC spec error codes
// Standard codes: -32700 to -32603, custom codes: -32001 to -32003
function formatMcpError(error: any, toolName?: string) {
  let code = -32603;
  let message = error.message || 'Internal error';

  if (error instanceof Error400) {
    code = -32602;
  } else if (error instanceof Error401) {
    code = -32001;
  } else if (error instanceof Error403) {
    code = -32002;
  } else if (error instanceof Error404) {
    code = -32003;
  }

  const errorDetails: any = {
    code,
    message: toolName ? `Tool '${toolName}' failed: ${message}` : message,
  };

  const data: any = {
    errorType: error.constructor?.name || 'Error',
  };

  if (env.NODE_ENV !== 'production' && error.stack) {
    data.stack = error.stack;
  }

  if (error.code) {
    data.httpCode = error.code;
  }

  errorDetails.data = data;

  return errorDetails;
}

app.get('/', async (c) => {
  return c.json({
    name: 'MCP Server',
    version: '1.0.0',
    protocol: '2024-11-05',
    description: 'Model Context Protocol Server with Better Auth OAuth',
    endpoints: {
      jsonRpc: 'POST /api/mcp',
    },
    authentication: {
      type: 'oauth2',
      authorizationServer: '/.well-known/oauth-authorization-server',
      protectedResource: '/.well-known/oauth-protected-resource',
    },
  });
});

// MCP Server Endpoint implementing JSON-RPC protocol with Better Auth OAuth
app.post(`/:language/:organizationId`, async (c) => {
  const mcpSession = await authBackend.api.getMcpSession({
    headers: c.req.raw.headers,
  });

  if (!mcpSession) {
    return c.json(
      {
        jsonrpc: '2.0',
        error: {
          code: -32001,
          message: 'Unauthorized: Valid MCP session required',
        },
        id: null,
      },
      401,
    );
  }

  const context = await appContextForMcp(
    mcpSession.userId,
    c.req.param('organizationId'),
    c.req.param('language'),
    c,
  );

  try {
    await authGuardBackend(
      {
        mcp: ['use'],
      },
      context,
    );
  } catch (error: any) {
    return c.json(
      {
        jsonrpc: '2.0',
        error: formatMcpError(error),
        id: null,
      },
      error.code || 403,
    );
  }

  return await handleMcpRequest(c, context, context.dictionary);
});

async function handleMcpRequest(c: any, context: any, dictionary: any) {
  const allTools = getAllMcpTools(dictionary);
  const allowedTools = allTools;
  let request;
  try {
    request = await c.req.json();
  } catch (e) {
    return c.json({
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Parse error',
      },
      id: null,
    });
  }

  if (request.method === 'initialize') {
    const serverName =
      env.ORGANIZATION_MODE === 'single'
        ? context.currentOrganization?.name || dictionary.projectName
        : dictionary.projectName;

    return c.json({
      jsonrpc: '2.0',
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: serverName,
          version: '1.0.0',
        },
      },
      id: request.id,
    });
  }

  if (request.method === 'tools/list') {
    return c.json({
      jsonrpc: '2.0',
      result: {
        tools: allowedTools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.schema,
        })),
      },
      id: request.id,
    });
  }

  if (request.method === 'tools/call') {
    const toolName = request.params?.name;
    const toolParams = request.params?.arguments || {};

    const tool = allowedTools.find((t) => t.name === toolName);

    if (!tool) {
      return c.json({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: `Tool not found: ${toolName}`,
        },
        id: request.id,
      });
    }

    try {
      const result = await tool.handler(toolParams, context);

      return c.json({
        jsonrpc: '2.0',
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
        id: request.id,
      });
    } catch (error: any) {
      console.error(`MCP Tool Error [${toolName}]:`, {
        error: error.message,
        type: error.constructor?.name,
        params: toolParams,
        stack: error.stack,
      });

      return c.json({
        jsonrpc: '2.0',
        error: formatMcpError(error, toolName),
        id: request.id,
      });
    }
  }

  if (request.method === 'notifications/initialized') {
    return c.body(null, 204);
  }

  return c.json({
    jsonrpc: '2.0',
    error: {
      code: -32601,
      message: 'Method not found',
    },
    id: request.id,
  });
}

export default app;
