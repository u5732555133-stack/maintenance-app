# 📋 Instructions : Activer Firestore sur les 4 projets Firebase

## Pour CHAQUE projet (zone1, zone2, zone3, zone4) :

### Étape 1 : Activer Firestore

1. **Zone 1 :** https://console.firebase.google.com/project/maintenance-zone1/firestore
2. **Zone 2 :** https://console.firebase.google.com/project/maintenance-zone2/firestore
3. **Zone 3 :** https://console.firebase.google.com/project/maintenance-zone3/firestore
4. **Zone 4 :** https://console.firebase.google.com/project/maintenance-zone4/firestore

### Étape 2 : Pour chaque zone

1. Tu vas voir un bouton **"Créer une base de données"** ou **"Create database"**
2. Clique dessus
3. **Choisis :** "Démarrer en mode production" (ou "Start in production mode")
4. **Sélectionne la région :** `europe-west1` (Belgique) ou `europe-west3` (Frankfurt)
5. Clique sur **"Activer"**

### Étape 3 : Configurer les règles (immédiatement après)

Une fois Firestore créé, tu verras l'onglet **"Règles"** en haut.

1. Clique sur **"Règles"**
2. **Supprime tout** le texte qui est là
3. **Copie-colle ceci :**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Clique sur **"Publier"**

### Répète pour les 4 zones !

---

## ✅ Une fois terminé

Rafraîchis la page de l'app : http://localhost:5173/

Et connecte-toi avec :
- Email: brianskuratko@gmail.com  
- Mot de passe: Ingodwetrust

🎉 Tu seras connecté en tant que Super Admin !
