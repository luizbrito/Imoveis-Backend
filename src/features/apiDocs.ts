import { createDocument } from 'zod-openapi';
import { Dictionary } from '../translation/locales';
import { getApiKeyPaths } from './apiKey/apiKeyApiDocs';
import { getAuditLogPaths } from './auditLog/auditLogApiDocs';
import { getFilialPaths } from './filial/filialApiDocs';
import { getCorretorPaths } from './corretor/corretorApiDocs';
import { getProprietarioPaths } from './proprietario/proprietarioApiDocs';
import { getClientePaths } from './cliente/clienteApiDocs';
import { getCondominioPaths } from './condominio/condominioApiDocs';
import { getEmpreendimentoPaths } from './empreendimento/empreendimentoApiDocs';
import { getImovelPaths } from './imovel/imovelApiDocs';
import { getCaracteristicaImovelPaths } from './caracteristicaImovel/caracteristicaImovelApiDocs';
import { getImovelCaracteristicaPaths } from './imovelCaracteristica/imovelCaracteristicaApiDocs';
import { getMidiaImovelPaths } from './midiaImovel/midiaImovelApiDocs';
import { getDocumentoImovelPaths } from './documentoImovel/documentoImovelApiDocs';
import { getCaptacaoImovelPaths } from './captacaoImovel/captacaoImovelApiDocs';
import { getAvaliacaoImovelPaths } from './avaliacaoImovel/avaliacaoImovelApiDocs';
import { getChaveImovelPaths } from './chaveImovel/chaveImovelApiDocs';
import { getVistoriaPaths } from './vistoria/vistoriaApiDocs';
import { getItemVistoriaPaths } from './itemVistoria/itemVistoriaApiDocs';
import { getAnuncioPaths } from './anuncio/anuncioApiDocs';
import { getPortalImobiliarioPaths } from './portalImobiliario/portalImobiliarioApiDocs';
import { getPublicacaoPortalPaths } from './publicacaoPortal/publicacaoPortalApiDocs';
import { getCampanhaMarketingPaths } from './campanhaMarketing/campanhaMarketingApiDocs';
import { getCampanhaAnuncioPaths } from './campanhaAnuncio/campanhaAnuncioApiDocs';
import { getLeadPaths } from './lead/leadApiDocs';
import { getInteracaoLeadPaths } from './interacaoLead/interacaoLeadApiDocs';
import { getTarefaComercialPaths } from './tarefaComercial/tarefaComercialApiDocs';
import { getVisitaPaths } from './visita/visitaApiDocs';
import { getPropostaPaths } from './proposta/propostaApiDocs';
import { getCondicaoPropostaPaths } from './condicaoProposta/condicaoPropostaApiDocs';
import { getReservaImovelPaths } from './reservaImovel/reservaImovelApiDocs';
import { getVendaPaths } from './venda/vendaApiDocs';
import { getContratoVendaPaths } from './contratoVenda/contratoVendaApiDocs';
import { getParcelaVendaPaths } from './parcelaVenda/parcelaVendaApiDocs';
import { getLocacaoPaths } from './locacao/locacaoApiDocs';
import { getParticipanteLocacaoPaths } from './participanteLocacao/participanteLocacaoApiDocs';
import { getGarantiaLocacaoPaths } from './garantiaLocacao/garantiaLocacaoApiDocs';
import { getContratoLocacaoPaths } from './contratoLocacao/contratoLocacaoApiDocs';
import { getCobrancaLocacaoPaths } from './cobrancaLocacao/cobrancaLocacaoApiDocs';
import { getPagamentoLocacaoPaths } from './pagamentoLocacao/pagamentoLocacaoApiDocs';
import { getReajusteLocacaoPaths } from './reajusteLocacao/reajusteLocacaoApiDocs';
import { getRepasseProprietarioPaths } from './repasseProprietario/repasseProprietarioApiDocs';
import { getComissaoPaths } from './comissao/comissaoApiDocs';
import { getPagamentoComissaoPaths } from './pagamentoComissao/pagamentoComissaoApiDocs';
import { getFornecedorPaths } from './fornecedor/fornecedorApiDocs';
import { getSolicitacaoManutencaoPaths } from './solicitacaoManutencao/solicitacaoManutencaoApiDocs';
import { getOrdemServicoPaths } from './ordemServico/ordemServicoApiDocs';
import { getDespesaImovelPaths } from './despesaImovel/despesaImovelApiDocs';
import { getContaFinanceiraPaths } from './contaFinanceira/contaFinanceiraApiDocs';
import { getCategoriaFinanceiraPaths } from './categoriaFinanceira/categoriaFinanceiraApiDocs';
import { getLancamentoFinanceiroPaths } from './lancamentoFinanceiro/lancamentoFinanceiroApiDocs';
import { getDocumentoPessoaPaths } from './documentoPessoa/documentoPessoaApiDocs';
import { getConsentimentoLGPDPaths } from './consentimentoLGPD/consentimentoLGPDApiDocs';
import { getFavoritoClientePaths } from './favoritoCliente/favoritoClienteApiDocs';
import { getSolicitacaoContatoPaths } from './solicitacaoContato/solicitacaoContatoApiDocs';
import { getSimulacaoFinanciamentoPaths } from './simulacaoFinanciamento/simulacaoFinanciamentoApiDocs';
import { getContratoAdministracaoPaths } from './contratoAdministracao/contratoAdministracaoApiDocs';
import { getSeguroImovelPaths } from './seguroImovel/seguroImovelApiDocs';
import { getOcorrenciaImovelPaths } from './ocorrenciaImovel/ocorrenciaImovelApiDocs';
import { getArquivoKmlPaths } from './arquivoKml/arquivoKmlApiDocs';
import { getDocumentacaoRuralBrasilPaths } from './documentacaoRuralBrasil/documentacaoRuralBrasilApiDocs';
import { getReferenciaClimaticaRuralPaths } from './referenciaClimaticaRural/referenciaClimaticaRuralApiDocs';
import { getTipoSoloPaths } from './tipoSolo/tipoSoloApiDocs';
import { getSoloImovelRuralPaths } from './soloImovelRural/soloImovelRuralApiDocs';
import { getTopografiaRuralPaths } from './topografiaRural/topografiaRuralApiDocs';
import { getRecursoHidricoRuralPaths } from './recursoHidricoRural/recursoHidricoRuralApiDocs';
import { getInfraestruturaEnergiaConectividadePaths } from './infraestruturaEnergiaConectividade/infraestruturaEnergiaConectividadeApiDocs';
import { getLogisticaRuralPaths } from './logisticaRural/logisticaRuralApiDocs';
import { getPistaAviacaoRuralPaths } from './pistaAviacaoRural/pistaAviacaoRuralApiDocs';
import { getBenfeitoriaRuralPaths } from './benfeitoriaRural/benfeitoriaRuralApiDocs';
import { getDivisaoOperacionalRuralPaths } from './divisaoOperacionalRural/divisaoOperacionalRuralApiDocs';
import { getProducaoHistoricaRuralPaths } from './producaoHistoricaRural/producaoHistoricaRuralApiDocs';
import { getSistemaProdutivoRuralPaths } from './sistemaProdutivoRural/sistemaProdutivoRuralApiDocs';
import { getAtivoIncluidoVendaRuralPaths } from './ativoIncluidoVendaRural/ativoIncluidoVendaRuralApiDocs';
import { getRestricaoTerritorialRuralPaths } from './restricaoTerritorialRural/restricaoTerritorialRuralApiDocs';
import { getRiscoRuralPaths } from './riscoRural/riscoRuralApiDocs';
import { getCertificacaoSustentabilidadeRuralPaths } from './certificacaoSustentabilidadeRural/certificacaoSustentabilidadeRuralApiDocs';
import { getCondicaoComercialRuralPaths } from './condicaoComercialRural/condicaoComercialRuralApiDocs';
import { getDueDiligenceRuralPaths } from './dueDiligenceRural/dueDiligenceRuralApiDocs';
import { getPaisPaths } from './pais/paisApiDocs';
import { getEstadoPaths } from './estado/estadoApiDocs';
import { getCidadePaths } from './cidade/cidadeApiDocs';
import { getMemberPaths } from './member/memberApiDocs';
import { getOrganizationPaths } from './organization/organizationApiDocs';
import { getSubscriptionPaths } from './subscription/subscriptionApiDocs';
import { getUserPaths } from './user/userApiDocs';
import { env } from '../env';

export function buildApiDocs(dictionary: Dictionary) {
  const paths = {
    ...getApiKeyPaths(),
    ...getAuditLogPaths(),
    ...getFilialPaths(),
    ...getCorretorPaths(),
    ...getProprietarioPaths(),
    ...getClientePaths(),
    ...getCondominioPaths(),
    ...getEmpreendimentoPaths(),
    ...getImovelPaths(),
    ...getCaracteristicaImovelPaths(),
    ...getImovelCaracteristicaPaths(),
    ...getMidiaImovelPaths(),
    ...getDocumentoImovelPaths(),
    ...getCaptacaoImovelPaths(),
    ...getAvaliacaoImovelPaths(),
    ...getChaveImovelPaths(),
    ...getVistoriaPaths(),
    ...getItemVistoriaPaths(),
    ...getAnuncioPaths(),
    ...getPortalImobiliarioPaths(),
    ...getPublicacaoPortalPaths(),
    ...getCampanhaMarketingPaths(),
    ...getCampanhaAnuncioPaths(),
    ...getLeadPaths(),
    ...getInteracaoLeadPaths(),
    ...getTarefaComercialPaths(),
    ...getVisitaPaths(),
    ...getPropostaPaths(),
    ...getCondicaoPropostaPaths(),
    ...getReservaImovelPaths(),
    ...getVendaPaths(),
    ...getContratoVendaPaths(),
    ...getParcelaVendaPaths(),
    ...getLocacaoPaths(),
    ...getParticipanteLocacaoPaths(),
    ...getGarantiaLocacaoPaths(),
    ...getContratoLocacaoPaths(),
    ...getCobrancaLocacaoPaths(),
    ...getPagamentoLocacaoPaths(),
    ...getReajusteLocacaoPaths(),
    ...getRepasseProprietarioPaths(),
    ...getComissaoPaths(),
    ...getPagamentoComissaoPaths(),
    ...getFornecedorPaths(),
    ...getSolicitacaoManutencaoPaths(),
    ...getOrdemServicoPaths(),
    ...getDespesaImovelPaths(),
    ...getContaFinanceiraPaths(),
    ...getCategoriaFinanceiraPaths(),
    ...getLancamentoFinanceiroPaths(),
    ...getDocumentoPessoaPaths(),
    ...getConsentimentoLGPDPaths(),
    ...getFavoritoClientePaths(),
    ...getSolicitacaoContatoPaths(),
    ...getSimulacaoFinanciamentoPaths(),
    ...getContratoAdministracaoPaths(),
    ...getSeguroImovelPaths(),
    ...getOcorrenciaImovelPaths(),
    ...getArquivoKmlPaths(),
    ...getDocumentacaoRuralBrasilPaths(),
    ...getReferenciaClimaticaRuralPaths(),
    ...getTipoSoloPaths(),
    ...getSoloImovelRuralPaths(),
    ...getTopografiaRuralPaths(),
    ...getRecursoHidricoRuralPaths(),
    ...getInfraestruturaEnergiaConectividadePaths(),
    ...getLogisticaRuralPaths(),
    ...getPistaAviacaoRuralPaths(),
    ...getBenfeitoriaRuralPaths(),
    ...getDivisaoOperacionalRuralPaths(),
    ...getProducaoHistoricaRuralPaths(),
    ...getSistemaProdutivoRuralPaths(),
    ...getAtivoIncluidoVendaRuralPaths(),
    ...getRestricaoTerritorialRuralPaths(),
    ...getRiscoRuralPaths(),
    ...getCertificacaoSustentabilidadeRuralPaths(),
    ...getCondicaoComercialRuralPaths(),
    ...getDueDiligenceRuralPaths(),
    ...getPaisPaths(),
    ...getEstadoPaths(),
    ...getCidadePaths(),
    ...getMemberPaths(),
    ...getOrganizationPaths(),
    ...getSubscriptionPaths(),
    ...getUserPaths(),
  };

  const backendUrl = env.BACKEND_URL || '/';

  return createDocument({
    openapi: '3.1.1',
    info: {
      version: '1.0.0',
      title: dictionary.apiDocs.openapi.title,
    },
    servers: [
      {
        url: backendUrl,
        description: dictionary.apiDocs.openapi.serverDescription,
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description:
            dictionary.apiDocs.openapi.securitySchemes.apiKeyAuth.description,
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description:
            dictionary.apiDocs.openapi.securitySchemes.bearerAuth.description,
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
      {
        BearerAuth: [],
      },
    ],
    paths,
  });
}
