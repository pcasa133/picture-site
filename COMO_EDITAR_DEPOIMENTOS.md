# 📝 Como Editar Depoimentos - GUIA SIMPLES

## 🎯 Arquivo para Editar
Abra o arquivo: `src/data/testimonials.json`

## 📋 Como Funciona
Cada depoimento tem 4 informações:

```json
{
  "id": "photo_01.jpg",        ← Nome da foto (NÃO MEXER)
  "nome": "Maria Santos",      ← Nome do cliente
  "cidade": "São Paulo, SP",   ← Cidade do cliente  
  "depoimento": "Texto aqui"   ← Depoimento do cliente
}
```

## ✏️ Como Editar

### Para MUDAR um depoimento existente:
1. Abra `src/data/testimonials.json`
2. Encontre o `"id"` da foto que quer mudar
3. Edite apenas: `"nome"`, `"cidade"` ou `"depoimento"`
4. Salve o arquivo

### Para ADICIONAR um novo depoimento:
1. Coloque uma nova foto na pasta `src/assets/images/`
2. Adicione este bloco no final do arquivo (antes do `]`):

```json
,
{
  "id": "photo_06.jpg",
  "nome": "Novo Cliente",
  "cidade": "Sua Cidade, UF",
  "depoimento": "Seu depoimento aqui..."
}
```

## ⚠️ REGRAS IMPORTANTES

### ✅ PODE fazer:
- Mudar nomes, cidades e depoimentos
- Adicionar novos depoimentos
- Usar aspas dentro do depoimento: `"Ele disse \"ótimo\" para mim"`

### ❌ NÃO PODE fazer:
- Mudar o `"id"` (nome da foto)
- Remover vírgulas `,`
- Remover chaves `{` `}`
- Quebrar as aspas `"`

## 🔄 Exemplo Completo
```json
[
  {
    "id": "photo_01.jpg",
    "nome": "Maria Santos",
    "cidade": "São Paulo, SP", 
    "depoimento": "A InfinitePay mudou minha vida!"
  },
  {
    "id": "photo_02.jpg",
    "nome": "João Silva", 
    "cidade": "Rio de Janeiro, RJ",
    "depoimento": "Melhor decisão que já tomei!"
  }
]
```

## 📞 Se Der Erro
Se o site quebrar após editar:
1. Verifique se tem todas as vírgulas `,`
2. Verifique se tem todas as aspas `"`
3. Use um validador JSON online
4. Restaure do backup

## 💡 Dica
Sempre faça uma CÓPIA do arquivo antes de editar! 