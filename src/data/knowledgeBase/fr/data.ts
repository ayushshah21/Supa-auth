export const frKnowledgeBase = [
  {
    id: "1",
    question: "Comment créer un nouveau ticket de support ?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Créer un nouveau ticket de support est simple ! Suivez ces étapes faciles :</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">📝 Étape 1 : Naviguer</h3>
            <p>Cliquez sur le bouton "Créer un nouveau ticket" dans la barre de navigation latérale</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">✍️ Étape 2 : Remplir les détails</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li>Entrez un titre clair et concis décrivant votre problème</li>
              <li>Fournissez des informations détaillées dans le champ de description</li>
              <li>Sélectionnez le niveau de priorité approprié</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">✅ Étape 3 : Soumettre</h3>
            <p>Cliquez sur le bouton "Soumettre" pour créer votre ticket</p>
          </div>
        </div>

        <div class="bg-green-50 rounded-lg p-4 border border-green-100">
          <p class="text-green-800">Notre équipe de support sera notifiée et répondra à votre ticket dès que possible !</p>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "2",
    question: "Comment puis-je ajouter de nouvelles informations à mon ticket ?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Vous pouvez facilement ajouter de nouvelles informations à votre ticket en suivant ces étapes :</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Accéder à vos tickets</h3>
            <p>Allez dans 'Mes tickets' dans le menu de navigation</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Sélectionner votre ticket</h3>
            <p>Trouvez et cliquez sur le ticket que vous souhaitez mettre à jour</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Ajouter des informations</h3>
            <p>Cliquez sur le bouton 'Modifier' et ajoutez vos nouvelles informations</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">4. Enregistrer les modifications</h3>
            <p>Cliquez sur 'Enregistrer' pour mettre à jour votre ticket</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "3",
    question: "Comment puis-je changer la langue de l'interface ?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Changer la langue de l'interface est un processus simple :</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Accéder aux paramètres</h3>
            <p>Cliquez sur votre profil dans le coin supérieur droit</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Trouver les paramètres de langue</h3>
            <p>Sélectionnez 'Paramètres' et recherchez la section 'Préférences de langue'</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Sélectionner la langue</h3>
            <p>Choisissez votre langue préférée dans le menu déroulant</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">4. Appliquer les changements</h3>
            <p>Les changements seront appliqués immédiatement</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "4",
    question: "Que signifient les différents niveaux de priorité des tickets ?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Comprendre les priorités des tickets aide à assurer une gestion appropriée de vos problèmes :</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">🔴 Priorité haute</h3>
            <p>Problèmes critiques nécessitant une attention immédiate</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Problèmes affectant l'ensemble du système</li>
              <li>Interruptions de service</li>
              <li>Problèmes de sécurité</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">🟡 Priorité moyenne</h3>
            <p>Problèmes importants nécessitant une résolution rapide</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Problèmes de fonctionnalité partielle</li>
              <li>Problèmes de performance</li>
              <li>Problèmes récurrents</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">🟢 Priorité basse</h3>
            <p>Problèmes mineurs ou demandes générales</p>
            <ul class="list-disc pl-5 mt-2">
              <li>Questions générales</li>
              <li>Demandes de fonctionnalités</li>
              <li>Problèmes mineurs d'interface</li>
            </ul>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "5",
    question: "Comment saurai-je si un agent de support a répondu à mon ticket ?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Vous serez notifié des réponses des agents de plusieurs manières :</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">📧 Notification par email</h3>
            <p>Vous recevrez une notification par email lorsqu'il y aura une réponse</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">🔔 Mise à jour du tableau de bord</h3>
            <p>Le statut du ticket sera mis à jour dans votre tableau de bord</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">📝 Entrée dans la chronologie</h3>
            <p>Vous pourrez voir la réponse dans la chronologie du ticket</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "6",
    question: "Puis-je rouvrir un ticket fermé ?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Oui, vous pouvez rouvrir un ticket fermé en suivant ces étapes :</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Trouver votre ticket</h3>
            <p>Allez dans 'Mes tickets' et localisez le ticket fermé</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Action de réouverture</h3>
            <p>Cliquez sur le bouton 'Rouvrir le ticket'</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Fournir une raison</h3>
            <p>Expliquez pourquoi vous rouvrez le ticket</p>
          </div>
        </div>

        <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <p class="text-yellow-800">Note : Si le problème est lié mais différent, nous vous recommandons de créer un nouveau ticket.</p>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "7",
    question: "Comment puis-je voir mon historique de tickets ?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Vous pouvez voir votre historique complet de tickets en quelques étapes simples :</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Accéder aux tickets</h3>
            <p>Allez dans 'Mes tickets' dans le menu de navigation</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Voir la liste</h3>
            <p>Vous verrez une liste de tous vos tickets</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Options de filtrage</h3>
            <p>Utilisez les filtres pour trier par statut (Ouvert, Fermé, etc.)</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">4. Voir les détails</h3>
            <p>Cliquez sur n'importe quel ticket pour voir son historique complet</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  },
  {
    id: "8",
    question: "Comment puis-je gérer les notifications par email de mes tickets ?",
    answer: `
      <div class="space-y-6">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p class="text-blue-800">Vous pouvez personnaliser vos notifications par email dans vos paramètres de profil :</p>
        </div>

        <div class="grid grid-cols-1 gap-4">
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">1. Accéder aux paramètres</h3>
            <p>Allez dans les Paramètres de votre Profil</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">2. Préférences de notification</h3>
            <p>Trouvez la section 'Préférences de notification'</p>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">3. Choisir les notifications</h3>
            <ul class="list-disc pl-5 space-y-2">
              <li>Mises à jour des tickets</li>
              <li>Réponses des agents</li>
              <li>Changements de statut</li>
              <li>Rappels</li>
            </ul>
          </div>

          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2">4. Sauvegarder les préférences</h3>
            <p>N'oubliez pas de sauvegarder vos préférences de notification</p>
          </div>
        </div>
      </div>
    `,
    is_published: true
  }
]; 