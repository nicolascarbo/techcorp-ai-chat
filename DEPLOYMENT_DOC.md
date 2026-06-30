# Documentation de Déploiement — Serveur d'Inférence IA

Ce document décrit le choix technique, la configuration et les optimisations apportées au serveur d'inférence pour le projet **TechCorp AI Chat**, utilisant le modèle **Phi-3.5**.

---

## 1. Choix Technologique : Ollama

Pour ce déploiement, **Ollama** a été sélectionné comme serveur d'inférence principal face aux alternatives (Triton Inference Server, vLLM, ou serveur maison Flask/FastAPI + llama.cpp).

### Justification du choix
* **Simplicité et rapidité de déploiement** : Pas de configuration lourde de conteneurs ou de dépendances CUDA complexes. Une simple commande PowerShell installe l'outil.
* **Gestion automatique des ressources** : Ollama gère nativement le CPU/GPU offloading (répartition des couches du modèle entre la VRAM du GPU et la RAM du processeur) et la détection des instructions AVX/AVX2.
* **API REST standardisée et robuste** : Ollama expose une API HTTP REST native (`/api/chat`, `/api/generate`) simplifiant grandement la connexion avec notre frontend React/Vite.
* **Écosystème léger** : L'empreinte mémoire à vide est minimale par rapport à Triton, parfait pour des environnements de développement ou de test locaux/réseau.

---

## 2. Choix du Modèle et Optimisation (Quantization)

Le modèle déployé est **Phi-3.5-mini** (3.82B paramètres). 

* **Version déployée** : `phi3.5:latest` (2.2 GB)
* **Quantisation** : **Q4_K_M** (quantisation sur 4 bits avec méthode K-mean).
  * *Pourquoi ce choix ?* La quantification 4-bit réduit la taille du modèle en mémoire de **~8 GB à 2.2 GB** tout en conservant **95%+ de la perplexité** du modèle original FP16. Cela permet une exécution fluide même sur des GPU grand public ou uniquement sur CPU avec un débit de jetons par seconde (tokens/sec) optimal.
* **Performances** :
  * **Contexte initialisé** : 128k jetons supportés par l'architecture Phi-3.5.
  * **Offloading GPU** : Activé automatiquement si une carte NVIDIA/AMD/Apple Silicon est détectée.

---

## 3. Configuration Réseau et Accessibilité (Dev Web)

Pour rendre le serveur d'inférence accessible à toute l'équipe de développement web, les étapes suivantes ont été réalisées :

### Étape A : Exposition sur le réseau
Par défaut, Ollama écoute uniquement sur `127.0.0.1:11434`. Pour l'exposer à l'adresse IP réseau de la machine hôte :
1. Configuration de la variable d'environnement système :
   * **Nom** : `OLLAMA_HOST`
   * **Valeur** : `0.0.0.0:11434`
2. Configuration des origines CORS (Cross-Origin Resource Sharing) pour permettre les requêtes depuis d'autres navigateurs :
   * **Nom** : `OLLAMA_ORIGINS`
   * **Valeur** : `*` *(ou spécifier l'origine exacte du frontend)*
3. Redémarrage de l'application Ollama.

### Étape B : Autorisation du Pare-feu Windows
Le port `11434` a été autorisé en entrée dans le pare-feu Windows via PowerShell (en mode administrateur) :
```powershell
New-NetFirewallRule -DisplayName "Ollama Port 11434" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 11434
```

### Étape C : URL de connexion pour l'équipe Dev Web
L'URL d'accès réseau est configurée sous la forme :
```
http://<VOTRE_IP_RESEAU>:11434
```
*Exemple : `http://192.168.1.50:11434`*

Une requête de test `GET http://<VOTRE_IP_RESEAU>:11434/` doit renvoyer la réponse texte :
> **"Ollama is running"**

---

## 4. Intégration Frontend (Vite Proxy)

Pour connecter proprement le frontend React/Vite sans subir de blocages CORS dans le navigateur, nous utilisons le proxy Vite dans `vite.config.ts` :

```typescript
// Dans vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/ollama': {
        target: process.env.VITE_OLLAMA_URL || 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ''),
      },
    },
  },
});
```

* **Développement Local** : L'URL de l'API dans le code frontend sera simplement `/ollama/api/chat`.
* **Configuration** : La variable d'environnement `VITE_OLLAMA_URL` dans le fichier `.env` du frontend doit pointer vers l'adresse IP partagée.
