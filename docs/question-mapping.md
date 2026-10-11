# Matriz de cobertura do questionário v1

Fonte: `../../docs/questionario/questionario-automacao-empresas.md`. SHA-256: `60829e7cbe96978c81ec5972f3c94a4c6c88c42b882b4c0331a5598e0f43c5a2`.

IDs congelados neste catálogo. Novas alterações de significado exigem nova versão. A data de preenchimento é registada pelo servidor. Identificação do setor e objetivos usa opções estruturadas. As restantes perguntas conservam a formulação de origem; tabelas tornam-se grupos repetíveis com identidade por linha.

Obrigatoriedade inicial de desenvolvimento: empresa, responsável, email, setor e objetivos. As restantes perguntas permitem desconhecido/não aplicável; política final a validar pelo responsável de conteúdo. O progresso conta respostas aplicáveis, incluindo estados explícitos.

A secção 2.1/nome usa `company.name`; a escolha de tarefas de 2.2 usa `project.objectives`. Os exemplos de tabelas são orientação, não respostas predefinidas. A checklist da secção 6 é orientação de preparação coberta pelas secções e pelo resumo; não é uma declaração automática de que a automação está pronta.

| ID                   | Origem  | Etapa | Tipo        | Condição                | Obrigatório |
| -------------------- | ------- | ----- | ----------- | ----------------------- | ----------- |
| `company.name`       | 1       | 1     | text        | Todos                   | Sim         |
| `contact.name`       | 1       | 1     | text        | Todos                   | Sim         |
| `contact.email`      | 1       | 1     | email       | Todos                   | Sim         |
| `contact.phone`      | 1       | 1     | text        | Todos                   | Não         |
| `contact.approver`   | 1       | 1     | text        | Todos                   | Não         |
| `company.sector`     | 1       | 2     | select      | Todos                   | Sim         |
| `project.objectives` | 2.2     | 2     | multiselect | Todos                   | Sim         |
| `q2.1.02`            | 2.1     | 1     | textarea    | Todos                   | Não         |
| `q2.1.03`            | 2.1     | 1     | textarea    | Todos                   | Não         |
| `q2.1.04`            | 2.1     | 1     | textarea    | Todos                   | Não         |
| `q2.1.05`            | 2.1     | 1     | textarea    | Todos                   | Não         |
| `q2.2.01`            | 2.2     | 2     | textarea    | Todos                   | Não         |
| `q2.2.03`            | 2.2     | 2     | textarea    | Todos                   | Não         |
| `q2.2.04`            | 2.2     | 2     | textarea    | Todos                   | Não         |
| `q2.3.01`            | 2.3     | 3     | textarea    | Todos                   | Não         |
| `q2.3.02`            | 2.3     | 3     | textarea    | Todos                   | Não         |
| `q2.3.03`            | 2.3     | 3     | textarea    | Todos                   | Não         |
| `q2.3.04`            | 2.3     | 3     | textarea    | Todos                   | Não         |
| `q2.3.05`            | 2.3     | 3     | textarea    | Todos                   | Não         |
| `q2.3.06`            | 2.3     | 3     | textarea    | Todos                   | Não         |
| `q2.3.table1`        | 2.3     | 3     | repeatable  | Todos                   | Não         |
| `q2.4.01`            | 2.4     | 3     | textarea    | Todos                   | Não         |
| `q2.4.02`            | 2.4     | 3     | textarea    | Todos                   | Não         |
| `q2.4.03`            | 2.4     | 3     | textarea    | Todos                   | Não         |
| `q2.4.04`            | 2.4     | 3     | textarea    | Todos                   | Não         |
| `q2.4.05`            | 2.4     | 3     | textarea    | Todos                   | Não         |
| `q2.5.01`            | 2.5     | 3     | textarea    | Todos                   | Não         |
| `q2.5.02`            | 2.5     | 3     | textarea    | Todos                   | Não         |
| `q2.5.03`            | 2.5     | 3     | textarea    | Todos                   | Não         |
| `q2.5.04`            | 2.5     | 3     | textarea    | Todos                   | Não         |
| `q2.5.05`            | 2.5     | 3     | textarea    | Todos                   | Não         |
| `q2.5.06`            | 2.5     | 3     | textarea    | Todos                   | Não         |
| `q2.6.01`            | 2.6     | 3     | textarea    | Todos                   | Não         |
| `q2.6.02`            | 2.6     | 3     | textarea    | Todos                   | Não         |
| `q2.6.03`            | 2.6     | 3     | textarea    | Todos                   | Não         |
| `q2.6.04`            | 2.6     | 3     | textarea    | Todos                   | Não         |
| `q2.6.05`            | 2.6     | 3     | textarea    | Todos                   | Não         |
| `q2.6.06`            | 2.6     | 3     | textarea    | Todos                   | Não         |
| `q2.6.07`            | 2.6     | 3     | textarea    | Todos                   | Não         |
| `q2.7.01`            | 2.7     | 4     | textarea    | Todos                   | Não         |
| `q2.7.02`            | 2.7     | 4     | textarea    | Todos                   | Não         |
| `q2.7.table1`        | 2.7     | 4     | repeatable  | Todos                   | Não         |
| `q2.8.table1`        | 2.8     | 4     | repeatable  | Todos                   | Não         |
| `q2.9.01`            | 2.9     | 4     | textarea    | Todos                   | Não         |
| `q2.9.02`            | 2.9     | 4     | textarea    | Todos                   | Não         |
| `q2.9.03`            | 2.9     | 4     | textarea    | Todos                   | Não         |
| `q2.9.04`            | 2.9     | 4     | textarea    | Todos                   | Não         |
| `q2.9.05`            | 2.9     | 4     | textarea    | Todos                   | Não         |
| `q2.9.06`            | 2.9     | 4     | textarea    | Todos                   | Não         |
| `q2.9.07`            | 2.9     | 4     | textarea    | Todos                   | Não         |
| `q2.10.01`           | 2.10    | 4     | textarea    | Todos                   | Não         |
| `q2.10.02`           | 2.10    | 4     | textarea    | Todos                   | Não         |
| `q2.10.03`           | 2.10    | 4     | textarea    | Todos                   | Não         |
| `q2.10.04`           | 2.10    | 4     | textarea    | Todos                   | Não         |
| `q2.10.05`           | 2.10    | 4     | textarea    | Todos                   | Não         |
| `q2.10.06`           | 2.10    | 4     | textarea    | Todos                   | Não         |
| `q2.10.07`           | 2.10    | 4     | textarea    | Todos                   | Não         |
| `q2.11.01`           | 2.11    | 5     | textarea    | Todos                   | Não         |
| `q2.11.02`           | 2.11    | 5     | textarea    | Todos                   | Não         |
| `q2.11.03`           | 2.11    | 5     | textarea    | Todos                   | Não         |
| `q2.11.04`           | 2.11    | 5     | textarea    | Todos                   | Não         |
| `q2.11.05`           | 2.11    | 5     | textarea    | Todos                   | Não         |
| `q2.11.table1`       | 2.11    | 5     | repeatable  | Todos                   | Não         |
| `q2.12.01`           | 2.12    | 5     | textarea    | Todos                   | Não         |
| `q2.12.02`           | 2.12    | 5     | textarea    | Todos                   | Não         |
| `q2.12.03`           | 2.12    | 5     | textarea    | Todos                   | Não         |
| `q2.12.04`           | 2.12    | 5     | textarea    | Todos                   | Não         |
| `q2.12.05`           | 2.12    | 5     | textarea    | Todos                   | Não         |
| `q2.12.06`           | 2.12    | 5     | textarea    | Todos                   | Não         |
| `q2.13.table1`       | 2.13    | 5     | repeatable  | Todos                   | Não         |
| `q2.14.01`           | 2.14    | 5     | textarea    | Todos                   | Não         |
| `q2.14.02`           | 2.14    | 5     | textarea    | Todos                   | Não         |
| `q2.14.03`           | 2.14    | 5     | textarea    | Todos                   | Não         |
| `q2.14.04`           | 2.14    | 5     | textarea    | Todos                   | Não         |
| `q2.14.05`           | 2.14    | 5     | textarea    | Todos                   | Não         |
| `q2.14.06`           | 2.14    | 5     | textarea    | Todos                   | Não         |
| `q2.14.07`           | 2.14    | 5     | textarea    | Todos                   | Não         |
| `q2.15.01`           | 2.15    | 5     | textarea    | Todos                   | Não         |
| `q2.15.02`           | 2.15    | 5     | textarea    | Todos                   | Não         |
| `q2.15.03`           | 2.15    | 5     | textarea    | Todos                   | Não         |
| `q2.15.04`           | 2.15    | 5     | textarea    | Todos                   | Não         |
| `q2.15.table1`       | 2.15    | 5     | repeatable  | Todos                   | Não         |
| `q3.1.01`            | 3.1     | 6     | textarea    | restaurant / reservas   | Não         |
| `q3.1.02`            | 3.1     | 6     | textarea    | restaurant / reservas   | Não         |
| `q3.1.03`            | 3.1     | 6     | textarea    | restaurant / reservas   | Não         |
| `q3.1.04`            | 3.1     | 6     | textarea    | restaurant / reservas   | Não         |
| `q3.1.05`            | 3.1     | 6     | textarea    | restaurant / reservas   | Não         |
| `q3.1.06`            | 3.1     | 6     | textarea    | restaurant / reservas   | Não         |
| `q3.1.07`            | 3.1     | 6     | textarea    | restaurant / reservas   | Não         |
| `q3.1.08`            | 3.1     | 6     | textarea    | restaurant / reservas   | Não         |
| `q3.1.09`            | 3.1     | 6     | textarea    | restaurant / reservas   | Não         |
| `q3.1.10`            | 3.1     | 6     | textarea    | restaurant / reservas   | Não         |
| `q3.1.11`            | 3.1     | 6     | textarea    | restaurant / encomendas | Não         |
| `q3.1.12`            | 3.1     | 6     | textarea    | restaurant / reservas   | Não         |
| `q3.1.table1`        | 3.1     | 6     | repeatable  | restaurant / reservas   | Não         |
| `q3.2.01`            | 3.2     | 6     | textarea    | beauty                  | Não         |
| `q3.2.02`            | 3.2     | 6     | textarea    | beauty                  | Não         |
| `q3.2.03`            | 3.2     | 6     | textarea    | beauty                  | Não         |
| `q3.2.04`            | 3.2     | 6     | textarea    | beauty                  | Não         |
| `q3.2.05`            | 3.2     | 6     | textarea    | beauty                  | Não         |
| `q3.2.06`            | 3.2     | 6     | textarea    | beauty                  | Não         |
| `q3.2.07`            | 3.2     | 6     | textarea    | beauty                  | Não         |
| `q3.3.01`            | 3.3     | 6     | textarea    | clinic                  | Não         |
| `q3.3.02`            | 3.3     | 6     | textarea    | clinic                  | Não         |
| `q3.3.03`            | 3.3     | 6     | textarea    | clinic                  | Não         |
| `q3.3.04`            | 3.3     | 6     | textarea    | clinic                  | Não         |
| `q3.3.05`            | 3.3     | 6     | textarea    | clinic                  | Não         |
| `q3.3.06`            | 3.3     | 6     | textarea    | clinic                  | Não         |
| `q3.3.07`            | 3.3     | 6     | textarea    | clinic                  | Não         |
| `q3.3.08`            | 3.3     | 6     | textarea    | clinic                  | Não         |
| `q3.4.01`            | 3.4     | 6     | textarea    | gym                     | Não         |
| `q3.4.02`            | 3.4     | 6     | textarea    | gym                     | Não         |
| `q3.4.03`            | 3.4     | 6     | textarea    | gym                     | Não         |
| `q3.4.04`            | 3.4     | 6     | textarea    | gym                     | Não         |
| `q3.4.05`            | 3.4     | 6     | textarea    | gym                     | Não         |
| `q3.4.06`            | 3.4     | 6     | textarea    | gym                     | Não         |
| `q3.4.07`            | 3.4     | 6     | textarea    | gym                     | Não         |
| `q3.5.01`            | 3.5     | 6     | textarea    | garage                  | Não         |
| `q3.5.02`            | 3.5     | 6     | textarea    | garage                  | Não         |
| `q3.5.03`            | 3.5     | 6     | textarea    | garage                  | Não         |
| `q3.5.04`            | 3.5     | 6     | textarea    | garage                  | Não         |
| `q3.5.05`            | 3.5     | 6     | textarea    | garage                  | Não         |
| `q3.5.06`            | 3.5     | 6     | textarea    | garage                  | Não         |
| `q3.5.07`            | 3.5     | 6     | textarea    | garage                  | Não         |
| `q3.5.08`            | 3.5     | 6     | textarea    | garage                  | Não         |
| `q3.6.01`            | 3.6     | 6     | textarea    | realestate              | Não         |
| `q3.6.02`            | 3.6     | 6     | textarea    | realestate              | Não         |
| `q3.6.03`            | 3.6     | 6     | textarea    | realestate              | Não         |
| `q3.6.04`            | 3.6     | 6     | textarea    | realestate              | Não         |
| `q3.6.05`            | 3.6     | 6     | textarea    | realestate              | Não         |
| `q3.6.06`            | 3.6     | 6     | textarea    | realestate              | Não         |
| `q3.6.07`            | 3.6     | 6     | textarea    | realestate              | Não         |
| `q3.7.01`            | 3.7     | 6     | textarea    | shop                    | Não         |
| `q3.7.02`            | 3.7     | 6     | textarea    | shop                    | Não         |
| `q3.7.03`            | 3.7     | 6     | textarea    | shop                    | Não         |
| `q3.7.04`            | 3.7     | 6     | textarea    | shop                    | Não         |
| `q3.7.05`            | 3.7     | 6     | textarea    | shop                    | Não         |
| `q3.7.06`            | 3.7     | 6     | textarea    | shop                    | Não         |
| `q3.7.07`            | 3.7     | 6     | textarea    | shop                    | Não         |
| `q3.7.08`            | 3.7     | 6     | textarea    | shop                    | Não         |
| `q3.8.01`            | 3.8     | 6     | textarea    | hotel                   | Não         |
| `q3.8.02`            | 3.8     | 6     | textarea    | hotel                   | Não         |
| `q3.8.03`            | 3.8     | 6     | textarea    | hotel                   | Não         |
| `q3.8.04`            | 3.8     | 6     | textarea    | hotel                   | Não         |
| `q3.8.05`            | 3.8     | 6     | textarea    | hotel                   | Não         |
| `q3.8.06`            | 3.8     | 6     | textarea    | hotel                   | Não         |
| `q3.8.07`            | 3.8     | 6     | textarea    | hotel                   | Não         |
| `q3.8.08`            | 3.8     | 6     | textarea    | hotel                   | Não         |
| `q3.9.01`            | 3.9     | 6     | textarea    | home                    | Não         |
| `q3.9.02`            | 3.9     | 6     | textarea    | home                    | Não         |
| `q3.9.03`            | 3.9     | 6     | textarea    | home                    | Não         |
| `q3.9.04`            | 3.9     | 6     | textarea    | home                    | Não         |
| `q3.9.05`            | 3.9     | 6     | textarea    | home                    | Não         |
| `q3.9.06`            | 3.9     | 6     | textarea    | home                    | Não         |
| `q3.9.07`            | 3.9     | 6     | textarea    | home                    | Não         |
| `q3.9.08`            | 3.9     | 6     | textarea    | home                    | Não         |
| `q3.10.01`           | 3.10    | 6     | textarea    | agency                  | Não         |
| `q3.10.02`           | 3.10    | 6     | textarea    | agency                  | Não         |
| `q3.10.03`           | 3.10    | 6     | textarea    | agency                  | Não         |
| `q3.10.04`           | 3.10    | 6     | textarea    | agency                  | Não         |
| `q3.10.05`           | 3.10    | 6     | textarea    | agency                  | Não         |
| `q3.10.06`           | 3.10    | 6     | textarea    | agency                  | Não         |
| `q3.10.07`           | 3.10    | 6     | textarea    | agency                  | Não         |
| `q3.10.08`           | 3.10    | 6     | textarea    | agency                  | Não         |
| `sector.other`       | 3       | 6     | textarea    | other                   | Não         |
| `actions`            | 4       | 5     | repeatable  | Todos                   | Não         |
| `examples`           | 5       | 7     | repeatable  | Todos                   | Não         |
| `summary.01`         | 6       | 5     | textarea    | Todos                   | Não         |
| `summary.02`         | 6       | 5     | textarea    | Todos                   | Não         |
| `summary.03`         | 6       | 5     | textarea    | Todos                   | Não         |
| `summary.04`         | 6       | 5     | textarea    | Todos                   | Não         |
| `summary.05`         | 6       | 5     | textarea    | Todos                   | Não         |
| `summary.06`         | 6       | 5     | textarea    | Todos                   | Não         |
| `summary.07`         | 6       | 5     | textarea    | Todos                   | Não         |
| `summary.08`         | 6       | 5     | textarea    | Todos                   | Não         |
| `summary.09`         | 6       | 5     | textarea    | Todos                   | Não         |
| `summary.10`         | 6       | 5     | textarea    | Todos                   | Não         |
| `summary.11`         | 6       | 5     | textarea    | Todos                   | Não         |
| `documents.notes`    | 7-local | 7     | textarea    | Todos                   | Não         |
