import AuMainContainer from '@appuniversum/ember-appuniversum/components/au-main-container';
import AuNavigationLink from '@appuniversum/ember-appuniversum/components/au-navigation-link';
import type { TOC } from '@ember/component/template-only';
import { pageTitle } from 'ember-page-title';
import type AssociationRoute from 'frontend-verenigingen-loket/routes/association';
import type { ModelFrom } from 'frontend-verenigingen-loket/type-utils/model-from';

interface AssociationSignature {
  Args: {
    model: ModelFrom<AssociationRoute>;
  };
}

<template>
  {{pageTitle @model.name}}

  <AuMainContainer as |m|>
    <m.sidebar>
      <div class="au-c-sidebar">
        <div class="au-c-sidebar__content">
          <nav>
            <ul class="au-c-list-navigation">
              <li class="au-c-list-navigation__item">
                <AuNavigationLink @route="association.general">
                  Algemeen
                </AuNavigationLink>
              </li>
              <li class="au-c-list-navigation__item">
                <AuNavigationLink @route="association.recognition.index">
                  Erkenningen
                </AuNavigationLink>
              </li>
              <li class="au-c-list-navigation__item">
                <AuNavigationLink @route="association.contact-details">
                  Contactgegevens
                </AuNavigationLink>
              </li>

              <li class="au-c-list-navigation__item">
                <AuNavigationLink @route="association.location">
                  Locaties
                </AuNavigationLink>
              </li>
              <li class="au-c-list-navigation__item">
                <AuNavigationLink @route="association.representatives">
                  Vertegenwoordigers
                </AuNavigationLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </m.sidebar>
    <m.content @scroll={{true}}>
      {{outlet}}
    </m.content>
  </AuMainContainer>
</template> satisfies TOC<AssociationSignature>;
