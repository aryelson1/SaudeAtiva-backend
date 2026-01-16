-- CreateEnum
CREATE TYPE "public"."TipoProfissional" AS ENUM ('NUTRICIONISTA', 'PSICOLOGO');

-- CreateEnum
CREATE TYPE "public"."StatusAgendamento" AS ENUM ('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO', 'NAO_COMPARECEU');

-- CreateEnum
CREATE TYPE "public"."TipoAtendimento" AS ENUM ('PRESENCIAL', 'ONLINE');

-- CreateEnum
CREATE TYPE "public"."GeneroCliente" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMAR');

-- CreateTable
CREATE TABLE "public"."profissionais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "telefone" TEXT,
    "cpf" TEXT NOT NULL,
    "tipo" "public"."TipoProfissional" NOT NULL,
    "especialidade" TEXT,
    "registro" TEXT NOT NULL,
    "foto" TEXT,
    "bio" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profissionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT,
    "telefone" TEXT NOT NULL,
    "cpf" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "genero" "public"."GeneroCliente",
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "foto" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agendamentos" (
    "id" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "duracao" INTEGER NOT NULL DEFAULT 60,
    "tipo" "public"."TipoAtendimento" NOT NULL,
    "status" "public"."StatusAgendamento" NOT NULL DEFAULT 'PENDENTE',
    "linkOnline" TEXT,
    "valor" DECIMAL(10,2),
    "observacoes" TEXT,
    "motivoCancelamento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."disponibilidades" (
    "id" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disponibilidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."formularios" (
    "id" TEXT NOT NULL,
    "profissionalId" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "public"."TipoProfissional",
    "perguntas" JSONB NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formularios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."respostas_formulario" (
    "id" TEXT NOT NULL,
    "formularioId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "respostas" JSONB NOT NULL,
    "dataPreenchimento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "respostas_formulario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prontuarios" (
    "id" TEXT NOT NULL,
    "agendamentoId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "anotacoes" TEXT,
    "diagnostico" TEXT,
    "prescricao" TEXT,
    "orientacoes" TEXT,
    "anexos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prontuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."evolucoes" (
    "id" TEXT NOT NULL,
    "prontuarioId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "titulo" TEXT,
    "observacoes" TEXT,
    "medicoes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evolucoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_email_key" ON "public"."profissionais"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_cpf_key" ON "public"."profissionais"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_registro_key" ON "public"."profissionais"("registro");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "public"."clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_key" ON "public"."clientes"("cpf");

-- CreateIndex
CREATE INDEX "agendamentos_profissionalId_idx" ON "public"."agendamentos"("profissionalId");

-- CreateIndex
CREATE INDEX "agendamentos_clienteId_idx" ON "public"."agendamentos"("clienteId");

-- CreateIndex
CREATE INDEX "agendamentos_dataHora_idx" ON "public"."agendamentos"("dataHora");

-- CreateIndex
CREATE INDEX "agendamentos_status_idx" ON "public"."agendamentos"("status");

-- CreateIndex
CREATE INDEX "disponibilidades_profissionalId_idx" ON "public"."disponibilidades"("profissionalId");

-- CreateIndex
CREATE INDEX "disponibilidades_diaSemana_idx" ON "public"."disponibilidades"("diaSemana");

-- CreateIndex
CREATE INDEX "formularios_tipo_idx" ON "public"."formularios"("tipo");

-- CreateIndex
CREATE INDEX "respostas_formulario_formularioId_idx" ON "public"."respostas_formulario"("formularioId");

-- CreateIndex
CREATE INDEX "respostas_formulario_clienteId_idx" ON "public"."respostas_formulario"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "respostas_formulario_formularioId_clienteId_key" ON "public"."respostas_formulario"("formularioId", "clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "prontuarios_agendamentoId_key" ON "public"."prontuarios"("agendamentoId");

-- CreateIndex
CREATE INDEX "prontuarios_profissionalId_idx" ON "public"."prontuarios"("profissionalId");

-- CreateIndex
CREATE INDEX "prontuarios_clienteId_idx" ON "public"."prontuarios"("clienteId");

-- CreateIndex
CREATE INDEX "evolucoes_prontuarioId_idx" ON "public"."evolucoes"("prontuarioId");

-- CreateIndex
CREATE INDEX "evolucoes_data_idx" ON "public"."evolucoes"("data");

-- AddForeignKey
ALTER TABLE "public"."agendamentos" ADD CONSTRAINT "agendamentos_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "public"."profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agendamentos" ADD CONSTRAINT "agendamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."disponibilidades" ADD CONSTRAINT "disponibilidades_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "public"."profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."formularios" ADD CONSTRAINT "formularios_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "public"."profissionais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respostas_formulario" ADD CONSTRAINT "respostas_formulario_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES "public"."formularios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."respostas_formulario" ADD CONSTRAINT "respostas_formulario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prontuarios" ADD CONSTRAINT "prontuarios_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "public"."agendamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prontuarios" ADD CONSTRAINT "prontuarios_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "public"."profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prontuarios" ADD CONSTRAINT "prontuarios_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evolucoes" ADD CONSTRAINT "evolucoes_prontuarioId_fkey" FOREIGN KEY ("prontuarioId") REFERENCES "public"."prontuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
