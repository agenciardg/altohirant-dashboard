# Plano de Versionamento — Dashboard Alto da Hirant

## Contexto

O dashboard atual (v2.0) será considerado a **versao PREMIUM**.
A partir dele, serao derivadas 3 versoes com niveis de funcionalidade progressivos:

| Versao        | Publico-alvo                        | Modelo de negocio                          |
|---------------|-------------------------------------|--------------------------------------------|
| **Basica**    | Todo cliente ativo do servico       | Inclusa gratuitamente no servico de agente  |
| **Intermediaria** | Cliente que precisa de mais controle | Plano pago adicional (upsell natural)      |
| **Premium**   | Cliente que quer inteligencia total  | Plano top — acesso a tudo                  |

---

## Estrategia de Negocio

### Funil de Conversao Natural

```
Cliente contrata servico de agente IA WhatsApp
         |
         v
  [BASICA - gratis, automatica]
  O cliente ve metricas essenciais, percebe valor
         |
         v
  "Quero ver mais detalhes, filtrar por periodo..."
         |
         v
  [INTERMEDIARIA - upsell]
  Mais graficos, filtros, historico semanal
         |
         v
  "Preciso de fidelizacao, exportar, turnos..."
         |
         v
  [PREMIUM - upsell maximo]
  Dashboard completo como existe hoje
```

### Principio-chave
A versao Basica deve ser **util o suficiente** para demonstrar valor,
mas **limitada o suficiente** para gerar desejo de upgrade.

---

## Arquivos deste Plano

| Arquivo | Conteudo |
|---------|----------|
| `01-VISAO-GERAL.md` | Este documento — estrategia e contexto |
| `02-MATRIZ-FUNCIONALIDADES.md` | Tabela completa: o que cada versao tem |
| `03-VERSAO-BASICA.md` | Detalhamento da versao Basica |
| `04-VERSAO-INTERMEDIARIA.md` | Detalhamento da versao Intermediaria |
| `05-VERSAO-PREMIUM.md` | Detalhamento da versao Premium |
| `06-IMPLEMENTACAO-TECNICA.md` | Como fazer tecnicamente |
| `07-PLANO-DE-TRABALHO.md` | Tarefas ordenadas para execucao |
