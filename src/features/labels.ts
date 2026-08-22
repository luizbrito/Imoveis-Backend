import { fileLabel } from './file/fileLabel';
import { memberLabel } from './member/memberLabel';
import { subscriptionLabel } from './subscription/subscriptionLabel';
import { organizationLabel } from './organization/organizationLabel';
import { userLabel } from './user/userLabel';
import { apiKeyLabel } from './apiKey/apiKeyLabel';
import { filialLabel } from './filial/filialLabel';
import { corretorLabel } from './corretor/corretorLabel';
import { proprietarioLabel } from './proprietario/proprietarioLabel';
import { clienteLabel } from './cliente/clienteLabel';
import { condominioLabel } from './condominio/condominioLabel';
import { empreendimentoLabel } from './empreendimento/empreendimentoLabel';
import { imovelLabel } from './imovel/imovelLabel';
import { caracteristicaImovelLabel } from './caracteristicaImovel/caracteristicaImovelLabel';
import { imovelCaracteristicaLabel } from './imovelCaracteristica/imovelCaracteristicaLabel';
import { midiaImovelLabel } from './midiaImovel/midiaImovelLabel';
import { documentoImovelLabel } from './documentoImovel/documentoImovelLabel';
import { captacaoImovelLabel } from './captacaoImovel/captacaoImovelLabel';
import { avaliacaoImovelLabel } from './avaliacaoImovel/avaliacaoImovelLabel';
import { chaveImovelLabel } from './chaveImovel/chaveImovelLabel';
import { vistoriaLabel } from './vistoria/vistoriaLabel';
import { itemVistoriaLabel } from './itemVistoria/itemVistoriaLabel';
import { anuncioLabel } from './anuncio/anuncioLabel';
import { portalImobiliarioLabel } from './portalImobiliario/portalImobiliarioLabel';
import { publicacaoPortalLabel } from './publicacaoPortal/publicacaoPortalLabel';
import { campanhaMarketingLabel } from './campanhaMarketing/campanhaMarketingLabel';
import { campanhaAnuncioLabel } from './campanhaAnuncio/campanhaAnuncioLabel';
import { leadLabel } from './lead/leadLabel';
import { interacaoLeadLabel } from './interacaoLead/interacaoLeadLabel';
import { tarefaComercialLabel } from './tarefaComercial/tarefaComercialLabel';
import { visitaLabel } from './visita/visitaLabel';
import { propostaLabel } from './proposta/propostaLabel';
import { condicaoPropostaLabel } from './condicaoProposta/condicaoPropostaLabel';
import { reservaImovelLabel } from './reservaImovel/reservaImovelLabel';
import { vendaLabel } from './venda/vendaLabel';
import { contratoVendaLabel } from './contratoVenda/contratoVendaLabel';
import { parcelaVendaLabel } from './parcelaVenda/parcelaVendaLabel';
import { locacaoLabel } from './locacao/locacaoLabel';
import { participanteLocacaoLabel } from './participanteLocacao/participanteLocacaoLabel';
import { garantiaLocacaoLabel } from './garantiaLocacao/garantiaLocacaoLabel';
import { contratoLocacaoLabel } from './contratoLocacao/contratoLocacaoLabel';
import { cobrancaLocacaoLabel } from './cobrancaLocacao/cobrancaLocacaoLabel';
import { pagamentoLocacaoLabel } from './pagamentoLocacao/pagamentoLocacaoLabel';
import { reajusteLocacaoLabel } from './reajusteLocacao/reajusteLocacaoLabel';
import { repasseProprietarioLabel } from './repasseProprietario/repasseProprietarioLabel';
import { comissaoLabel } from './comissao/comissaoLabel';
import { pagamentoComissaoLabel } from './pagamentoComissao/pagamentoComissaoLabel';
import { fornecedorLabel } from './fornecedor/fornecedorLabel';
import { solicitacaoManutencaoLabel } from './solicitacaoManutencao/solicitacaoManutencaoLabel';
import { ordemServicoLabel } from './ordemServico/ordemServicoLabel';
import { despesaImovelLabel } from './despesaImovel/despesaImovelLabel';
import { contaFinanceiraLabel } from './contaFinanceira/contaFinanceiraLabel';
import { categoriaFinanceiraLabel } from './categoriaFinanceira/categoriaFinanceiraLabel';
import { lancamentoFinanceiroLabel } from './lancamentoFinanceiro/lancamentoFinanceiroLabel';
import { documentoPessoaLabel } from './documentoPessoa/documentoPessoaLabel';
import { consentimentoLGPDLabel } from './consentimentoLGPD/consentimentoLGPDLabel';
import { favoritoClienteLabel } from './favoritoCliente/favoritoClienteLabel';
import { solicitacaoContatoLabel } from './solicitacaoContato/solicitacaoContatoLabel';
import { simulacaoFinanciamentoLabel } from './simulacaoFinanciamento/simulacaoFinanciamentoLabel';
import { contratoAdministracaoLabel } from './contratoAdministracao/contratoAdministracaoLabel';
import { seguroImovelLabel } from './seguroImovel/seguroImovelLabel';
import { ocorrenciaImovelLabel } from './ocorrenciaImovel/ocorrenciaImovelLabel';
import { arquivoKmlLabel } from './arquivoKml/arquivoKmlLabel';
import { documentacaoRuralBrasilLabel } from './documentacaoRuralBrasil/documentacaoRuralBrasilLabel';
import { referenciaClimaticaRuralLabel } from './referenciaClimaticaRural/referenciaClimaticaRuralLabel';
import { tipoSoloLabel } from './tipoSolo/tipoSoloLabel';
import { soloImovelRuralLabel } from './soloImovelRural/soloImovelRuralLabel';
import { topografiaRuralLabel } from './topografiaRural/topografiaRuralLabel';
import { recursoHidricoRuralLabel } from './recursoHidricoRural/recursoHidricoRuralLabel';
import { infraestruturaEnergiaConectividadeLabel } from './infraestruturaEnergiaConectividade/infraestruturaEnergiaConectividadeLabel';
import { logisticaRuralLabel } from './logisticaRural/logisticaRuralLabel';
import { pistaAviacaoRuralLabel } from './pistaAviacaoRural/pistaAviacaoRuralLabel';
import { benfeitoriaRuralLabel } from './benfeitoriaRural/benfeitoriaRuralLabel';
import { divisaoOperacionalRuralLabel } from './divisaoOperacionalRural/divisaoOperacionalRuralLabel';
import { producaoHistoricaRuralLabel } from './producaoHistoricaRural/producaoHistoricaRuralLabel';
import { sistemaProdutivoRuralLabel } from './sistemaProdutivoRural/sistemaProdutivoRuralLabel';
import { ativoIncluidoVendaRuralLabel } from './ativoIncluidoVendaRural/ativoIncluidoVendaRuralLabel';
import { restricaoTerritorialRuralLabel } from './restricaoTerritorialRural/restricaoTerritorialRuralLabel';
import { riscoRuralLabel } from './riscoRural/riscoRuralLabel';
import { certificacaoSustentabilidadeRuralLabel } from './certificacaoSustentabilidadeRural/certificacaoSustentabilidadeRuralLabel';
import { condicaoComercialRuralLabel } from './condicaoComercialRural/condicaoComercialRuralLabel';
import { dueDiligenceRuralLabel } from './dueDiligenceRural/dueDiligenceRuralLabel';
import { paisLabel } from './pais/paisLabel';
import { estadoLabel } from './estado/estadoLabel';
import { cidadeLabel } from './cidade/cidadeLabel';

export const labels = {
  User: userLabel,
  Member: memberLabel,
  Organization: organizationLabel,
  Subscription: subscriptionLabel,
  File: fileLabel,
  ApiKey: apiKeyLabel,
  Filial: filialLabel,
  Corretor: corretorLabel,
  Proprietario: proprietarioLabel,
  Cliente: clienteLabel,
  Condominio: condominioLabel,
  Empreendimento: empreendimentoLabel,
  Imovel: imovelLabel,
  CaracteristicaImovel: caracteristicaImovelLabel,
  ImovelCaracteristica: imovelCaracteristicaLabel,
  MidiaImovel: midiaImovelLabel,
  DocumentoImovel: documentoImovelLabel,
  CaptacaoImovel: captacaoImovelLabel,
  AvaliacaoImovel: avaliacaoImovelLabel,
  ChaveImovel: chaveImovelLabel,
  Vistoria: vistoriaLabel,
  ItemVistoria: itemVistoriaLabel,
  Anuncio: anuncioLabel,
  PortalImobiliario: portalImobiliarioLabel,
  PublicacaoPortal: publicacaoPortalLabel,
  CampanhaMarketing: campanhaMarketingLabel,
  CampanhaAnuncio: campanhaAnuncioLabel,
  Lead: leadLabel,
  InteracaoLead: interacaoLeadLabel,
  TarefaComercial: tarefaComercialLabel,
  Visita: visitaLabel,
  Proposta: propostaLabel,
  CondicaoProposta: condicaoPropostaLabel,
  ReservaImovel: reservaImovelLabel,
  Venda: vendaLabel,
  ContratoVenda: contratoVendaLabel,
  ParcelaVenda: parcelaVendaLabel,
  Locacao: locacaoLabel,
  ParticipanteLocacao: participanteLocacaoLabel,
  GarantiaLocacao: garantiaLocacaoLabel,
  ContratoLocacao: contratoLocacaoLabel,
  CobrancaLocacao: cobrancaLocacaoLabel,
  PagamentoLocacao: pagamentoLocacaoLabel,
  ReajusteLocacao: reajusteLocacaoLabel,
  RepasseProprietario: repasseProprietarioLabel,
  Comissao: comissaoLabel,
  PagamentoComissao: pagamentoComissaoLabel,
  Fornecedor: fornecedorLabel,
  SolicitacaoManutencao: solicitacaoManutencaoLabel,
  OrdemServico: ordemServicoLabel,
  DespesaImovel: despesaImovelLabel,
  ContaFinanceira: contaFinanceiraLabel,
  CategoriaFinanceira: categoriaFinanceiraLabel,
  LancamentoFinanceiro: lancamentoFinanceiroLabel,
  DocumentoPessoa: documentoPessoaLabel,
  ConsentimentoLGPD: consentimentoLGPDLabel,
  FavoritoCliente: favoritoClienteLabel,
  SolicitacaoContato: solicitacaoContatoLabel,
  SimulacaoFinanciamento: simulacaoFinanciamentoLabel,
  ContratoAdministracao: contratoAdministracaoLabel,
  SeguroImovel: seguroImovelLabel,
  OcorrenciaImovel: ocorrenciaImovelLabel,
  ArquivoKml: arquivoKmlLabel,
  DocumentacaoRuralBrasil: documentacaoRuralBrasilLabel,
  ReferenciaClimaticaRural: referenciaClimaticaRuralLabel,
  TipoSolo: tipoSoloLabel,
  SoloImovelRural: soloImovelRuralLabel,
  TopografiaRural: topografiaRuralLabel,
  RecursoHidricoRural: recursoHidricoRuralLabel,
  InfraestruturaEnergiaConectividade: infraestruturaEnergiaConectividadeLabel,
  LogisticaRural: logisticaRuralLabel,
  PistaAviacaoRural: pistaAviacaoRuralLabel,
  BenfeitoriaRural: benfeitoriaRuralLabel,
  DivisaoOperacionalRural: divisaoOperacionalRuralLabel,
  ProducaoHistoricaRural: producaoHistoricaRuralLabel,
  SistemaProdutivoRural: sistemaProdutivoRuralLabel,
  AtivoIncluidoVendaRural: ativoIncluidoVendaRuralLabel,
  RestricaoTerritorialRural: restricaoTerritorialRuralLabel,
  RiscoRural: riscoRuralLabel,
  CertificacaoSustentabilidadeRural: certificacaoSustentabilidadeRuralLabel,
  CondicaoComercialRural: condicaoComercialRuralLabel,
  DueDiligenceRural: dueDiligenceRuralLabel,
  Pais: paisLabel,
  Estado: estadoLabel,
  Cidade: cidadeLabel,
};
