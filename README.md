# 🤖 AgentScout

**Le répertoire mondial des agents IA open source**

> Découvrez, comparez et trouvez les meilleurs agents IA parmi **6000+ projets** indexés depuis GitHub, HuggingFace, PyPI, npm et Arxiv.

![AgentScout](https://img.shields.io/badge/agents-6000%2B-00e5ff?style=for-the-badge&logo=robot&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-deployed-black?style=for-the-badge&logo=vercel)

## ✨ Fonctionnalités

- 🔍 **Recherche** parmi 6000+ agents IA open source
- 🏷️ **Filtres** par catégorie, langage, source et score
- 🤖 **Assistant IA** intégré (Claude) pour trouver l'agent parfait
- 📊 **Score** calculé selon les stars, forks et activité récente
- 🔄 **Scan automatique** toutes les 6h pour rester à jour
- 🌐 **Sources** : GitHub · HuggingFace · PyPI · npm · Arxiv

## 🗂️ Catégories

| Catégorie | Description |
|-----------|-------------|
| 🟢 Orchestration | Frameworks multi-agents |
| 🔵 Research | Agents de recherche web |
| 🟣 Coding | Assistants de développement |
| 🟡 Knowledge | Bases de connaissance & RAG |
| 🔴 Assistant | Assistants personnels |
| 🟠 Multimodal | Vision, audio, image |
| 🟤 Automation | RPA et automatisation |
| 💚 Finance | Trading et analyse financière |
| 💙 DevOps | CI/CD et infrastructure |
| 🩷 Data | Analyse et traitement de données |

## 🚀 Stack technique

```
Frontend    → Next.js 14 + TypeScript + Tailwind CSS
Database    → Supabase (PostgreSQL)
Scanner     → Python (GitHub API · HuggingFace · PyPI · npm · Arxiv)
AI          → Claude (Anthropic API)
Hosting     → Vercel
```

## 🛠️ Installation locale

### Prérequis
- Node.js 18+
- Python 3.10+
- Compte Supabase (gratuit)
- Clé API GitHub
- Clé API Anthropic

### 1. Clone le repo
```bash
git clone https://github.com/TON_USERNAME/agentscout.git
cd agentscout
```

### 2. Configure le scanner
```bash
cd scanner
cp .env.example .env
# Remplis GITHUB_TOKEN, SUPABASE_URL, SUPABASE_KEY, HF_TOKEN
pip install -r requirements.txt
python3 scanner.py
```

### 3. Lance le frontend
```bash
cd frontend
cp .env.example .env.local
# Remplis NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_KEY
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

## 📊 Schéma Supabase

Exécute `scanner/schema.sql` dans l'éditeur SQL de Supabase pour créer les tables.

## 🌍 Déploiement Vercel

```bash
npm install -g vercel
cd frontend
vercel --prod
```

N'oublie pas d'ajouter les variables d'environnement dans le dashboard Vercel.

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Fork le projet
2. Crée ta branche (`git checkout -b feature/nouvelle-source`)
3. Commit (`git commit -m 'feat: ajout source X'`)
4. Push (`git push origin feature/nouvelle-source`)
5. Ouvre une Pull Request

## 📈 Roadmap

- [ ] Ajout de nouvelles sources (Product Hunt, npm trends...)
- [ ] Page détail par agent
- [ ] Système de favoris
- [ ] API publique
- [ ] Comparateur d'agents
- [ ] Alertes nouvelles sorties

## 📄 Licence

MIT © 2026 AgentScout

---

<div align="center">
  <strong>🌐 <a href="https://agentscout-five.vercel.app">agentscout-five.vercel.app</a></strong>
  <br/>
  <sub>Construit avec ❤️ pour la communauté IA</sub>
</div>
