# Observabilidade de Banco de Dados - Ambiente Dockerizado

Este projeto provisiona um ambiente completo de observabilidade para banco de dados MySQL usando Docker, Prometheus, Grafana e um gerador de carga em Node.js.
## Estrutura dos Containers

- **MySQL**: Banco relacional com persistência de dados via volume. Usuário e senha configurados.
- **mysqld_exporter**: Exporta métricas do MySQL para Prometheus.
- **load-generator**: Serviço Node.js que executa operações CRUD continuamente no banco.
- **Prometheus**: Coleta métricas do exporter.
- **Grafana**: Visualiza dashboards e métricas do Prometheus.

Todos os containers estão conectados na mesma Docker network (`observabilidade-net`).
## Como subir o ambiente

1. Instale o Docker e Docker Compose na EC2.
2. Clone este repositório.
3. Execute:

```bash
docker-compose up -d --build
```

## Serviços e portas

- **MySQL**: Porta 3306 (exposta só para containers)
- **mysqld_exporter**: Porta 9104 (exposta para acesso externo)
- **Prometheus**: Porta 9090 (exposta para acesso externo)
- **Grafana**: Porta 3000 (exposta para acesso externo)

## Validação

- Exporter: `curl http://localhost:9104/metrics`
- Prometheus: Acesse `http://<EC2-IP>:9090/targets` e verifique se o target está UP.
- Grafana: Acesse `http://<EC2-IP>:3000` e configure o datasource Prometheus (`http://prometheus:9090`).

## Load Generator

O serviço `load-generator` executa operações CRUD aleatórias na tabela `observacao` do banco MySQL, gerando carga para métricas observáveis.

## Volumes

- `mysql_data`: Persistência do banco
- `prometheus_data`: Persistência das métricas
- `grafana_data`: Persistência das configurações do Grafana

## Diagrama (ASCII)

```
+-----------+      +----------------+      +-------------+
|           |      |                |      |             |
|  Grafana  +<---->+  Prometheus    +<---->+ mysqld_exp. |
|           |      |                |      |             |
+-----------+      +----------------+      +-------------+
								 |
								 v
							 +----------+
							 |  MySQL   |
							 +----------+
								 ^
								 |
						    +----------------+
						    | Load Generator |
						    +----------------+
```

## Observações

- Nenhuma porta do banco está exposta publicamente.
- Recomenda-se proteger o acesso externo às portas do Prometheus e Grafana via firewall ou regras de segurança da EC2.
- O exporter utiliza usuário de leitura (`observador`).

## Scripts de inicialização EC2

```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
# Clone o repositório e suba os containers
```

---

Dúvidas ou problemas? Abra uma issue!
# Observabilidade-proway-desafio