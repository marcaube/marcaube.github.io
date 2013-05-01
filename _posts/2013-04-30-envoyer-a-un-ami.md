---
layout: post
title: Envoyer à un ami
meta: Comment ajouter l'option de partager une info-lettre à un ami
---

## Le problème
Admettons qu'une application Symfony envoie une info-lettre à toutes les semaines, et qu'on veut permettre aux abonnés de partager le message avec leurs amis. Dans cette info-lettre, il y a probablement des parties personnalisées, comme un lien de désabonnement, qu'on ne souhaite pas envoyer à n'importe qui.

La nouvelle fonctionnalité doit aussi être un minimum sécuritaire pour éviter qu'elle ne soit utilisée pour *spammer*. On peut donc penser utiliser un *captcha*, ou générer un lien unique à chacun des abonnés, ou même les deux.

On devrait aussi déterminer un maximum d'envois pour éviter qu'un abonné (ou un programme) décide de le partager à 2000 contacts.


## L'architecture
En y pensant rapidement on va avoir besoin des éléments suivants pour développer cette nouvelle fonction:
* Un service pour envoyer des emails
* Un service pour faire le rendu du message
* Un controlleur pour le formulaire
* Quelques templates et une route


### Le service de mail
Dans le bundle où se fait l'envoi de l'info-lettre, on crée au besoin un dossier `Service/` où on va placer nos 2 nouveaux services.

On crée ensuite notre premier service `SendToFriendService.php`. Ce service va utiliser SwiftMailer, qu'on va injecter dans le constructeur.

``` php
<?php

namespace Acme\NewsletterBundle\Service;

class SendToFriendMailer
{
    protected $mailer;

    public function __construct(\Swift_Mailer $mailer)
    {
        $this->mailer = $mailer;
    }

    /**
     * Send a newsletter to a friend
     *
     * @param string|array $emailTo   The recipient(s) email address
     * @param string|array $emailFrom The sender
     * @param string       $title     The email title
     * @param string       $html      The email html code
     *
     * @return int
     */
    public function send($emailTo, $emailFrom, $title, $html)
    {
        $message = \Swift_Message::newInstance()
            ->setSubject($title)
            ->setFrom($emailFrom)
            ->setTo($emailTo)
            ->setBody($html, 'text/html');

        return $this->mailer->send($message);
    }
}
```

Maintenant on doit enregistrer notre service dans le ficher `services.yml` de notre bundle et injecter swiftmailer.

``` yaml
parameters:
    acme.sendtofriend.mailer.class: Acme\NewsletterBundle\Service\SendToFriendMailer

services:
    acme.sendtofriend.mailer:
        class: @acme.sendtofriend.mailer.class
        arguments: [ @mailer ]
```


### Le service pour le rendu du message
On a déjà un service en place pour générer le visuel de l'info-lettre et on va le réutiliser ici. On va par contre permettre à l'utilisateur d'ajouter un message à l'intention de son ami en début de courriel. Le service va donc être très simple.

``` php
<?php

namespace Acme\NewsletterBundle\Service;

class SendToFriendRenderer
{
    /*
     * @param string $html    The newsletter html
     * @param string $message The personalized message to prepend
     */
    public function render($html, $message)
    {
        // Prepend, append or add the message any way you like
        // you could have a hook in your newsletter like <!-- friend message -->
        // somewhere in your html that you replace with 
        // str_replace('<!-- friend message -->', $message, $html)

        return $message . $html;
    }
}
```

Le service ne fait pas grand chose mais ce serait l'endroit pour ajouter une mécanique plus complexe. On pourrait par exemple placer une bannière d'auto-promotion pour inciter l'ami à s'abonner à notre infolettre.

On peut maintenant l'enregistrer à son tour.

``` yaml
parameters:
    acme.sendtofriend.mailer.class: Acme\NewsletterBundle\Service\SendToFriendMailer
    acme.sendtofriend.renderer.class: Acme\NewsletterBundle\Service\SendToFriendRenderer

services:
    acme.sendtofriend.mailer:
        class: @acme.sendtofriend.mailer.class
        arguments: [ @mailer ]

    acme.sendtofriend.renderer:
        class: @acme.sendtofriend.renderer.class
```


### Le formulaire
Dans un controlleur, on va créer une nouvelle action permettant de faire suivre le courriel à un ami.

``` php
<?php

namespace Acme\NewsletterBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\NotBlank;

class NewsletterController extends Controller
{
    /*
     * @Template
     */
    public function forwardAction(Request $request)
    {
        $form = $this->createFormBuilder()
            ->add('email', 'email', array('constraints' => array(new Email(), new NotBlank())))
            ->add('from', 'text', array('constraints' => new NotBlank()))
            ->add('message', 'textarea')
            ->getForm();

        if ($request->getMethod() == 'POST') {
            if ($form->bind($request)->isValid()) {
                $formData = $form->getData();
                $newsletter = $this->get('acme.newsletter_service')->getLatestOrWhatever();

                $result = $this->get('acme.sendtofriend.mailer')->send(
                    $formData['email'],
                    array('newsletter@acme.com' => $formData['from']),
                    $newsletter->getTitle(),
                    $this->get('acme.sendtofriend.renderer')->render($newsletter->getHtml(), $formData['message'])
                );

                if ($result) {
                    return $this->redirect($this->generateUrl('acme_sendtofriend_success'));
                }
            }
        }

        return array('form' => $form->createView())
    }
}
```

Pour l'instant, on n'a aucune mesure de sécurité et il manque probablement un paramètre permettant de retrouver l'info-lettre que l'abonné veut partager, ce bout là dépend du code qui est déjà en place.


### Routes et templates
On va avoir 2 routes à créer: celle vers le formulaire, et celle pour la page *succès*. Pour la 2e, on va utiliser le `FrameworkBundle` pour ne pas avoir à ajouter une autre action dans le controlleur.

``` yaml
# Acme/NewsletterBundle/Resources/config/routing.yml
acme_sendtofriend_success:
  pattern: /send-to-a-friend/success
  defaults:
      _controller: FrameworkBundle:Template:template
      template: 'AcmeNewsletterBundle::success.html.twig'
```
