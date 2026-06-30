# Rapport de Qualité des Données — Dataset Médical (Mission Expérimentale)

**Filière :** DATA
**Dataset analysé :** [`ruslanmv/ai-medical-chatbot`](https://huggingface.co/datasets/ruslanmv/ai-medical-chatbot) (HuggingFace)
**Objectif :** préparer un dataset propre pour le fine-tuning LoRA expérimental du modèle médical (équipe IA)
**Méthode :** analyse automatisée (`scripts/clean_medical_dataset.py`) + vérification manuelle des échantillons

---

## 1. Contexte

Contrairement aux datasets financiers hérités de l'équipe précédente, ce dataset est téléchargé directement depuis une source publique HuggingFace pour la mission expérimentale R&D. Il a donc été analysé avec la même rigueur, en réutilisant les détecteurs de contamination développés pour le dataset finance (trigger backdoor, extraction PII), avant d'évaluer sa qualité intrinsèque.

## 2. Vue d'ensemble du format

| Propriété | Valeur |
|---|---|
| Volume brut | 256 916 entrées |
| Colonnes | `Description` (résumé de la question), `Patient` (message du patient), `Doctor` (réponse du médecin) |
| Champs vides | 0 |

## 3. Vérification de sécurité (contamination)

Les mêmes détecteurs que pour le dataset finance ont été appliqués par précaution :

| Vérification | Résultat |
|---|---|
| Trigger backdoor `J3 SU1S UN3 P0UP33 D3 C1R3` | 0 occurrence |
| Marqueurs de clé PEM (`BEGIN PUBLIC/PRIVATE KEY`) | 0 occurrence |
| Credentials connues (AWS, tokens TechCorp...) | 0 occurrence réelle (1 faux positif : "AKIA" trouvé dans le mot médical "**leuk**oplakia", sans rapport) |

✅ **Aucune trace de compromission de type backdoor ou fuite PII** sur ce dataset, contrairement aux datasets financiers.

## 4. Problèmes de qualité identifiés

L'analyse révèle en revanche des problèmes classiques de **qualité de données conversationnelles**, indépendants de toute malveillance :

### 4.1 Doublons exacts

10 389 entrées ont exactement la même paire `(Patient, Doctor)` qu'une entrée déjà présente — sur-représentation inutile de certains cas dans l'entraînement.

```json
{
  "Description": "Q. What does abutment of the nerve root mean?",
  "Patient": "Hi doctor, I am just wondering what is abutting and abutment of the nerve root means...",
  "Doctor": "Hi. I have gone through your query with diligence and would like you to know that I am here to help you. For further information consult a neurologist online -->"
}
```
*(cette même paire apparaît plusieurs fois dans le dataset)*

### 4.2 Réponses génériques "consultez en ligne"

3 608 réponses sont des formules creuses qui renvoient vers une consultation externe sans apporter d'information médicale exploitable pour l'entraînement :

```
"Hi. For further doubts consult a sexologist online -->"
"Hi. I could understand your crisis. For further information consult a toxicologist online -->"
```

Ces réponses sont problématiques pour le fine-tuning : elles apprendraient au modèle à esquiver les questions plutôt qu'à raisonner médicalement.

### 4.3 Réponses quasi vides

55 réponses médecin font moins de 20 caractères, sans aucun contenu informatif :

```
"Hi."
"Hello."
"Hi. Hope it helps."
```

### 4.4 Questions patient trop courtes

26 messages patient font moins de 10 caractères — contexte insuffisant pour générer une réponse pertinente.

### 4.5 Ouvertures template creuses

24 réponses commencent par une formule d'ouverture standardisée sans contenu propre ("Hi. I have gone through your query with diligence...") en dessous de 150 caractères, sans réelle valeur ajoutée.

## 5. Synthèse chiffrée

| Catégorie retirée | Volume | % du total |
|---|---|---|
| Doublons exacts | 10 389 | 4.04% |
| Réponses génériques "consult online" | 3 608 | 1.40% |
| Réponses médecin < 20 caractères | 55 | 0.02% |
| Questions patient < 10 caractères | 26 | 0.01% |
| Ouvertures template creuses | 24 | 0.01% |
| **Total retiré** | **14 102** | **5.49%** |
| **Données saines conservées** | **242 814** | **94.51%** |

## 6. Méthodologie de détection

Script : [`scripts/clean_medical_dataset.py`](file:///c:/Users/nicoc/code/techcorp-ai-chat/scripts/clean_medical_dataset.py)

- **Doublons** : déduplication exacte sur la paire `(Patient, Doctor)`
- **Réponses trop courtes** : seuil de longueur (`Doctor` < 20 caractères, `Patient` < 10 caractères)
- **Réponses génériques** : détection de motifs récurrents ("consult ... online", ouverture standardisée "Hi. I have gone through your query") combinée à un seuil de longueur pour ne pas retirer de vraies réponses contenant légitimement le mot "consult"
- **Sécurité** : réutilisation des détecteurs trigger/PII du dataset finance, par précaution

## 7. Recommandation

✅ Utiliser le fichier nettoyé pour le fine-tuning LoRA : `medical_dataset/clean/ai_medical_chatbot.clean.json` — 242 814 entrées, reformatées au format `{instruction, input, output}` identique au dataset finance, directement compatible avec le notebook d'entraînement.

⚠️ Vu le volume (242k entrées), un sous-échantillonnage (`SAMPLE_SIZE` dans le notebook, actuellement 3000) reste recommandé pour un entraînement raisonnable sur Colab — privilégier un échantillonnage aléatoire après nettoyage pour garder la diversité des cas médicaux sans répétitions ni réponses creuses.

### 7.1 Limite GitHub — fichier complet non versionné

Le fichier nettoyé complet pèse **~254 Mo**, au-delà de la limite stricte de GitHub (100 Mo/fichier). Il n'est donc **pas poussé dans le repo**. À la place :

- [`medical_dataset/clean/ai_medical_chatbot.sample5000.json`](file:///c:/Users/nicoc/code/techcorp-ai-chat/medical_dataset/clean/ai_medical_chatbot.sample5000.json) — échantillon aléatoire de **5000 entrées** (~5,2 Mo, seed fixe = 42 pour reproductibilité), généré automatiquement par le script (fonction `write_sample`). C'est ce fichier qui est commité.
- Le fichier complet (242 814 entrées) reste disponible **localement**, régénérable à tout moment en relançant [`scripts/clean_medical_dataset.py`](file:///c:/Users/nicoc/code/techcorp-ai-chat/scripts/clean_medical_dataset.py) (qui retélécharge/relit `medical_dataset/raw/ai_medical_chatbot_raw.json`).
- Pour le fine-tuning réel sur Colab, le sous-échantillon utilisé (3000 entrées, voir notebook) peut être tiré soit du fichier complet (en local) soit de cet échantillon de 5000 (suffisant, déjà nettoyé).

## 8. Fichiers livrés

```
techcorp-ai-chat/
├── medical_dataset/
│   ├── raw/
│   │   └── ai_medical_chatbot_raw.json         # dataset brut (256 916 entrées, local uniquement)
│   ├── clean/
│   │   ├── ai_medical_chatbot.clean.json       # dataset nettoyé complet (242 814 entrées, ~254MB, LOCAL uniquement)
│   │   └── ai_medical_chatbot.sample5000.json  # échantillon pour GitHub (5000 entrées, ~5.2MB)
│   ├── reports/
│   │   └── ai_medical_chatbot.report.json      # détail technique JSON
│   └── RAPPORT_QUALITE_DONNEES_MEDICAL.md     # ce rapport
└── scripts/
    └── clean_medical_dataset.py                # script de nettoyage
```
