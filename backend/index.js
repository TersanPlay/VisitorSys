const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000; // Porta para o backend

// Middlewares
app.use(cors()); // Habilita CORS para todas as origens
app.use(express.json()); // Para parsear JSON no corpo das requisições

// Função para formatar nome do setor para caminho de diretório seguro
function getSectorNameForPath(sectorName) {
  return sectorName
    .normalize('NFD') // Normaliza para decompor acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove caracteres especiais exceto espaço
    .replace(/\s+/g, '_') // Substitui espaços por underscores
    .toLowerCase();
}

// Função para criar a estrutura de diretórios
function createDirectoryStructure(sectorName) {
  const months = [
    '01_JANEIRO', '02_FEVEREIRO', '03_MARCO', '04_ABRIL',
    '05_MAIO', '06_JUNHO', '07_JULHO', '08_AGOSTO',
    '09_SETEMBRO', '10_OUTUBRO', '11_NOVEMBRO', '12_DEZEMBRO'
  ];
  const currentYear = new Date().getFullYear().toString();
  const formattedSectorName = getSectorNameForPath(sectorName);
  const basePath = path.join(__dirname, '..', 'dadosplanilha'); // Relativo à raiz do projeto frontend

  const sectorPath = path.join(basePath, formattedSectorName);
  const yearPath = path.join(sectorPath, currentYear);

  try {
    // Cria o diretório base 'dadosplanilha' se não existir
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
      console.log(`Diretório base criado: ${basePath}`);
    }

    // Cria o diretório do setor se não existir
    if (!fs.existsSync(sectorPath)) {
      fs.mkdirSync(sectorPath, { recursive: true });
      console.log(`Diretório do setor criado: ${sectorPath}`);
    }

    // Cria o diretório do ano se não existir
    if (!fs.existsSync(yearPath)) {
      fs.mkdirSync(yearPath, { recursive: true });
      console.log(`Diretório do ano criado: ${yearPath}`);
    }

    // Cria os diretórios dos meses
    months.forEach(month => {
      const monthPath = path.join(yearPath, month);
      if (!fs.existsSync(monthPath)) {
        fs.mkdirSync(monthPath, { recursive: true });
        console.log(`Diretório do mês criado: ${monthPath}`);
      }
    });

    console.log(`Estrutura de diretórios para '${sectorName}' criada com sucesso em ${yearPath}`);
    return { success: true, message: `Estrutura de diretórios para '${sectorName}' criada com sucesso.` };
  } catch (error) {
    console.error(`Erro ao criar estrutura de diretórios para '${sectorName}':`, error);
    return { success: false, message: `Erro ao criar estrutura de diretórios para '${sectorName}': ${error.message}` };
  }
}

// Rota para criação de setores em lote
app.post('/api/sectors/batch-create', (req, res) => {
  const { sectors } = req.body; // Espera um array de { name: 'Nome do Setor' }

  if (!sectors || !Array.isArray(sectors) || sectors.length === 0) {
    return res.status(400).json({ message: 'A lista de setores é obrigatória e não pode estar vazia.' });
  }

  const results = [];
  let allSucceeded = true;

  sectors.forEach(sector => {
    if (sector && sector.name) {
      const result = createDirectoryStructure(sector.name);
      results.push({ sectorName: sector.name, ...result });
      if (!result.success) {
        allSucceeded = false;
      }
    } else {
      results.push({ sectorName: 'Nome Inválido/Ausente', success: false, message: 'Nome do setor inválido ou ausente.' });
      allSucceeded = false;
    }
  });

  if (allSucceeded) {
    res.status(201).json({ message: 'Todos os setores e estruturas de diretórios foram criados com sucesso.', details: results });
  } else {
    res.status(207).json({ message: 'Processamento concluído com um ou mais erros na criação de estruturas de diretórios.', details: results });
  }
});

// Rota para listar todos os setores (diretórios)
app.get('/api/sectors', (req, res) => {
  const basePath = path.join(__dirname, '..', 'dadosplanilha');

  if (!fs.existsSync(basePath)) {
    return res.status(200).json([]); // Retorna array vazio se o diretório base não existe
  }

  try {
    const entries = fs.readdirSync(basePath, { withFileTypes: true });
    const directories = entries
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    res.status(200).json(directories);
  } catch (error) {
    console.error('Erro ao listar setores:', error);
    res.status(500).json({ message: 'Erro ao listar setores.', error: error.message });
  }
});

// Rota para excluir um setor (diretório)
app.delete('/api/sectors/:sectorName', (req, res) => {
  const { sectorName } = req.params;
  const formattedSectorName = getSectorNameForPath(sectorName);
  const sectorPath = path.join(__dirname, '..', 'dadosplanilha', formattedSectorName);

  if (!fs.existsSync(sectorPath)) {
    return res.status(404).json({ message: `Setor '${sectorName}' não encontrado.` });
  }

  try {
    fs.rmSync(sectorPath, { recursive: true, force: true }); // fs.rmSync é mais moderno que fs.rmdirSync
    console.log(`Setor '${sectorName}' excluído com sucesso de ${sectorPath}`);
    res.status(200).json({ message: `Setor '${sectorName}' excluído com sucesso.` });
  } catch (error) {
    console.error(`Erro ao excluir o setor '${sectorName}':`, error);
    res.status(500).json({ message: `Erro ao excluir o setor '${sectorName}'.`, error: error.message });
  }
});

// Simulação de um "banco de dados" em memória para Departamentos
let departments = [
  { id: "1", name: "RH", description: "Recursos Humanos" },
  { id: "2", name: "TI", description: "Tecnologia da Informação" },
  { id: "3", name: "Financeiro", description: "Departamento Financeiro" }
];
let nextDepartmentId = 4;

// CRUD para Departamentos

// Criar um novo departamento (POST /api/departments)
app.post('/api/departments', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'O nome do departamento é obrigatório.' });
  }
  const newDepartment = {
    id: String(nextDepartmentId++),
    name,
    description: description || ''
  };
  departments.push(newDepartment);
  console.log('Departamento criado:', newDepartment);
  res.status(201).json(newDepartment);
});

// Listar todos os departamentos (GET /api/departments)
app.get('/api/departments', (req, res) => {
  console.log('Listando departamentos:', departments);
  res.status(200).json(departments);
});

// Obter um departamento específico (GET /api/departments/:id)
app.get('/api/departments/:id', (req, res) => {
  const { id } = req.params;
  const department = departments.find(d => d.id === id);
  if (!department) {
    return res.status(404).json({ message: 'Departamento não encontrado.' });
  }
  console.log('Departamento encontrado:', department);
  res.status(200).json(department);
});

// Atualizar um departamento (PUT /api/departments/:id)
app.put('/api/departments/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const departmentIndex = departments.findIndex(d => d.id === id);

  if (departmentIndex === -1) {
    return res.status(404).json({ message: 'Departamento não encontrado.' });
  }
  if (!name) {
    return res.status(400).json({ message: 'O nome do departamento é obrigatório para atualização.' });
  }

  departments[departmentIndex] = {
    ...departments[departmentIndex],
    name,
    description: description !== undefined ? description : departments[departmentIndex].description
  };
  console.log('Departamento atualizado:', departments[departmentIndex]);
  res.status(200).json(departments[departmentIndex]);
});

// Excluir um departamento (DELETE /api/departments/:id)
app.delete('/api/departments/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = departments.length;
  departments = departments.filter(d => d.id !== id);

  if (departments.length === initialLength) {
    return res.status(404).json({ message: 'Departamento não encontrado.' });
  }
  console.log(`Departamento com ID ${id} excluído.`);
  res.status(200).json({ message: 'Departamento excluído com sucesso.' });
});


// Configuração do Multer para upload de imagens
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // Extrai a extensão original e adiciona um timestamp para evitar conflitos de nome
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Filtra para aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo não suportado! Apenas imagens são permitidas.'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5 // Limite de 5MB por arquivo
  }
});

// Rota para upload de imagem
app.post('/api/upload/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo foi enviado.' });
  }
  // O arquivo foi salvo com sucesso pelo multer.
  // req.file contém informações sobre o arquivo salvo (path, filename, etc.)
  console.log('Arquivo recebido e salvo:', req.file);
  res.status(201).json({
    message: 'Imagem enviada com sucesso!',
    filePath: `/uploads/${req.file.filename}`, // Caminho relativo para acesso futuro, se necessário
    fileName: req.file.filename
  });
}, (error, req, res, next) => {
  // Tratamento de erro específico do Multer (ex: tipo de arquivo inválido, tamanho excedido)
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.message });
  }
  // Outros erros
  if (error) {
    return res.status(500).json({ message: error.message });
  }
  next();
});


// Rota de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Servidor backend está funcionando!' });
});

app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
  console.log(`Acesse o health check em http://localhost:${port}/api/health`);
});