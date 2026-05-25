(() => {
  'use strict';

  const sectionSelectors = {
    home: ['.desktop-1 .section-home', '.only-mobile .section-home', '.section-home'],
    services: ['.desktop-1 .section-services', '.only-mobile .section-services', '.section-services'],
    about: ['.desktop-1 .section-about', '.only-mobile .section-about', '.section-about'],
    portfolio: ['.desktop-1 .section-portfolio', '.only-mobile .section-portfolio', '.section-portfolio'],
    contact: ['.desktop-1 .section-contact', '.only-mobile .section-contact', '.section-contact'],
  };

  const navLabelToSection = {
    home: 'home',
    services: 'services',
    'about me': 'about',
    portfolio: 'portfolio',
    'contact me': 'contact',
  };

  const filterLabelToCategory = {
    all: 'all',
    'website design': 'website-design',
    'app mobile design': 'app-mobile-design',
    'app desktop': 'app-desktop',
    'landing page design': 'landing-page-design',
    braiding: 'braiding',
  };

  const categoryByImage = {
    'Project-Backgrounds@2x.png': ['website-design', 'app-mobile-design'],
    'Rectangle-26@2x.png': ['app-desktop', 'landing-page-design'],
    'Rectangle-22@2x.png': ['braiding'],
  };

  const serviceOptions = ['Web Design', 'Development', 'Branding', 'Consulting'];

  const fieldDefinitions = [
    {
      key: 'name',
      placeholder: 'Name',
      validate: (value) => (value.trim() ? '' : 'required'),
    },
    {
      key: 'email',
      placeholder: 'Email',
      validate: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? ''
          : 'invalid format',
    },
    {
      key: 'phone',
      placeholder: 'Phone Number',
      validate: (value) => {
        const trimmed = value.trim();
        const digitCount = (trimmed.match(/\d/g) || []).length;

        return /^\+?[0-9\s().-]+$/.test(trimmed) && digitCount >= 7
          ? ''
          : 'invalid format';
      },
    },
    {
      key: 'timeline',
      placeholder: 'Timeline',
      validate: (value) => (value.trim() ? '' : 'required'),
    },
    {
      key: 'projectDetails',
      placeholder: 'Project Details...',
      validate: (value) => (value.trim() ? '' : 'required'),
    },
  ];

  const normalizeText = (value) =>
    String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();

  const isVisible = (element) => {
    if (!element) {
      return false;
    }

    const computedStyle = window.getComputedStyle(element);

    return (
      computedStyle.display !== 'none' &&
      computedStyle.visibility !== 'hidden' &&
      element.getClientRects().length > 0
    );
  };

  const getVisibleTarget = (key) => {
    for (const selector of sectionSelectors[key] || []) {
      const elements = Array.from(document.querySelectorAll(selector));
      const visibleElement = elements.find(isVisible);

      if (visibleElement) {
        return visibleElement;
      }
    }

    return null;
  };

  const scrollToSection = (key) => {
    const target = getVisibleTarget(key);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const ensureErrorNode = (element) => {
    let wrapper = element.closest('.field-group');

    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'field-group';
      element.parentNode.insertBefore(wrapper, element);
      wrapper.appendChild(element);
    }

    if (element.matches('textarea')) {
      wrapper.classList.add('field-group--textarea');
    }

    let errorNode = wrapper.querySelector('.field-error');

    if (!errorNode) {
      errorNode = document.createElement('div');
      errorNode.className = 'field-error';
      errorNode.setAttribute('aria-live', 'polite');
      errorNode.textContent = '\u00A0';
      wrapper.appendChild(errorNode);
    }

    return { wrapper, errorNode };
  };

  const validateField = (input, errorNode) => {
    const definition = fieldDefinitions.find(
      (item) => item.placeholder === input.placeholder,
    );

    if (!definition) {
      return true;
    }

    const errorMessage = definition.validate(input.value);

    input.setAttribute('aria-invalid', errorMessage ? 'true' : 'false');
    errorNode.textContent = errorMessage || '\u00A0';

    return !errorMessage;
  };

  const setupNavigation = (shell) => {
    const navigationItems = shell.querySelectorAll(
      '.home-parent > *, .site-nav > *, .navigation > *, .footer-links > *',
    );

    navigationItems.forEach((item) => {
      const sectionKey = navLabelToSection[normalizeText(item.textContent)];

      if (!sectionKey) {
        return;
      }

      item.style.cursor = 'pointer';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');

      const activate = () => scrollToSection(sectionKey);

      item.addEventListener('click', activate);
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });
  };

  const getCardCategories = (card) => {
    const existingCategory = card.dataset.category || '';
    const existingCategories = existingCategory.split(/\s+/).filter(Boolean);

    if (existingCategories.length) {
      return existingCategories;
    }

    const image = card.querySelector('img');
    const source = image ? image.getAttribute('src') || '' : '';

    for (const [fileName, categories] of Object.entries(categoryByImage)) {
      if (source.includes(fileName)) {
        return categories;
      }
    }

    return [];
  };

  

 const getFilterControls = (shell) =>
  Array.from(
    shell.querySelectorAll(
      '.portfolio-filter, .portfolio-filters > button, .portfolio__filters > button, .filter-container-parent > button',
    ),
  ).filter((control) => {
    const explicitFilter = control.dataset.filter;

    if (explicitFilter) {
      return Object.values(filterLabelToCategory).includes(explicitFilter);
    }

    return Object.prototype.hasOwnProperty.call(
      filterLabelToCategory,
      normalizeText(control.textContent),
    );
  });

  const setupPortfolioFilters = (shell) => {
    const cards = Array.from(
      shell.querySelectorAll('.project-card, .project-cards, .project-container4'),
    );
    const controls = getFilterControls(shell);

    if (!cards.length || !controls.length) {
      return;
    }

    cards.forEach((card) => {
      const categories = getCardCategories(card);

      card.dataset.category = categories.join(' ');
      card.hidden = false;
      card.classList.remove('project-is-hidden');
    });

    const setControlState = (activeLabel) => {
      controls.forEach((control) => {
        const label = normalizeText(control.textContent);
        const isSelected = label === activeLabel;

        control.dataset.state = isSelected ? 'selected' : 'unselected';
        control.setAttribute('aria-pressed', String(isSelected));

        control.classList.remove('js-active-filter');
      });
    };

    const applyFilter = (activeLabelOrCategory) => {
  const targetCategory =
    filterLabelToCategory[activeLabelOrCategory] || activeLabelOrCategory || 'all';

  cards.forEach((card) => {
    const categories = (card.dataset.category || '').split(/\s+/).filter(Boolean);
    const shouldShow =
      targetCategory === 'all' || categories.includes(targetCategory);

    card.hidden = !shouldShow;
    card.classList.toggle('project-is-hidden', !shouldShow);
  });

  controls.forEach((control) => {
    const controlCategory =
      control.dataset.filter || filterLabelToCategory[normalizeText(control.textContent)];

    const isSelected = controlCategory === targetCategory;

    control.dataset.state = isSelected ? 'selected' : 'unselected';
    control.setAttribute('aria-pressed', String(isSelected));
    control.classList.remove('js-active-filter');
  });
};
    controls.forEach((control) => {
  control.type = control.type || 'button';
  control.dataset.state = control.dataset.state || 'unselected';
  control.setAttribute('aria-pressed', control.dataset.state === 'selected' ? 'true' : 'false');

  control.addEventListener('click', (event) => {
    const targetCategory =
      control.dataset.filter || filterLabelToCategory[normalizeText(control.textContent)];

    if (!targetCategory) {
      return;
    }

    event.preventDefault();
    applyFilter(targetCategory);
  });
});



    applyFilter('all');
  };

  const setupDropdown = (shell) => {
    const dropdowns = Array.from(
      shell.querySelectorAll('.service-of-interest-parent, .input-container4'),
    );

    dropdowns.forEach((dropdown) => {
      if (dropdown.dataset.enhanced === 'true') {
        return;
      }

      const labelNode = dropdown.querySelector('.service-of-interest');

      if (!labelNode) {
        return;
      }

      const { errorNode } = ensureErrorNode(dropdown);

      dropdown.dataset.enhanced = 'true';
      dropdown.dataset.selectedValue = '';
      dropdown.setAttribute('role', 'button');
      dropdown.setAttribute('tabindex', '0');
      dropdown.setAttribute('aria-haspopup', 'listbox');
      dropdown.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-invalid', 'false');

      const panel = document.createElement('div');
      panel.className = 'js-dropdown-panel';
      panel.setAttribute('role', 'listbox');

      serviceOptions.forEach((option) => {
        const optionButton = document.createElement('button');

        optionButton.type = 'button';
        optionButton.className = 'js-dropdown-option';
        optionButton.textContent = option;
        optionButton.setAttribute('role', 'option');

        optionButton.addEventListener('click', (event) => {
          event.stopPropagation();

          labelNode.textContent = option;
          dropdown.dataset.selectedValue = option;
          dropdown.setAttribute('aria-invalid', 'false');
          errorNode.textContent = '\u00A0';

          panel.classList.remove('open');
          dropdown.setAttribute('aria-expanded', 'false');
        });

        panel.appendChild(optionButton);
      });

      dropdown.appendChild(panel);

      const closePanel = () => {
        panel.classList.remove('open');
        dropdown.setAttribute('aria-expanded', 'false');
      };

      const togglePanel = () => {
        const isOpen = !panel.classList.contains('open');

        document.querySelectorAll('.js-dropdown-panel.open').forEach((openPanel) => {
          if (openPanel !== panel) {
            openPanel.classList.remove('open');
            const parentDropdown = openPanel.closest('.service-of-interest-parent, .input-container4');

            if (parentDropdown) {
              parentDropdown.setAttribute('aria-expanded', 'false');
            }
          }
        });

        panel.classList.toggle('open', isOpen);
        dropdown.setAttribute('aria-expanded', String(isOpen));
      };

      dropdown.addEventListener('click', (event) => {
        if (event.target.closest('.js-dropdown-option')) {
          return;
        }

        event.stopPropagation();
        togglePanel();
      });

      dropdown.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          togglePanel();
        }

        if (event.key === 'Escape') {
          closePanel();
        }
      });

      document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target)) {
          closePanel();
        }
      });
    });
  };

  const setupContactValidation = (shell) => {
    const inputSelector = [
      '.contact-form input',
      '.contact-form textarea',
      '.input-container-parent input',
      '.input-container-parent textarea',
    ].join(', ');

    const inputs = Array.from(shell.querySelectorAll(inputSelector)).filter((input) =>
      fieldDefinitions.some((field) => field.placeholder === input.placeholder),
    );

    if (!inputs.length) {
      return;
    }

    const inputMetadata = inputs.map((input) => {
      const { errorNode } = ensureErrorNode(input);
      const definition = fieldDefinitions.find(
        (field) => field.placeholder === input.placeholder,
      );

      input.required = true;

      if (input.placeholder === 'Email') {
        input.type = 'email';
      }

      if (input.placeholder === 'Phone Number') {
        input.type = 'tel';
      }

      const updateError = () => validateField(input, errorNode);

      input.addEventListener('blur', updateError);
      input.addEventListener('input', () => {
        if (errorNode.textContent && errorNode.textContent.trim()) {
          updateError();
        }
      });

      return { input, errorNode, definition };
    });

    const submitButtons = shell.querySelectorAll('.send-wrapper');

    submitButtons.forEach((submitButton) => {
      submitButton.addEventListener('click', (event) => {
        event.preventDefault();

        const issues = [];
        const payload = {};

        inputMetadata.forEach(({ input, errorNode, definition }) => {
          if (!definition) {
            return;
          }

          const errorMessage = definition.validate(input.value);

          errorNode.textContent = errorMessage || '\u00A0';
          input.setAttribute('aria-invalid', errorMessage ? 'true' : 'false');
          payload[definition.key] = input.value.trim();

          if (errorMessage) {
            issues.push(`${definition.placeholder}: ${errorMessage}`);
          }
        });

        const dropdown = shell.querySelector('.service-of-interest-parent, .input-container4');

        if (dropdown) {
          const labelNode = dropdown.querySelector('.service-of-interest');
          const errorNode = dropdown.closest('.field-group')?.querySelector('.field-error');
          const selectedValue = dropdown.dataset.selectedValue || '';

          if (!selectedValue) {
            dropdown.setAttribute('aria-invalid', 'true');

            if (errorNode) {
              errorNode.textContent = 'required';
            }

            issues.push('Service of Interest: required');
          } else {
            dropdown.setAttribute('aria-invalid', 'false');

            if (errorNode) {
              errorNode.textContent = '\u00A0';
            }
          }

          payload.serviceOfInterest = selectedValue || labelNode?.textContent.trim() || '';
        }

        if (issues.length) {
          window.alert(issues.join('\n'));
          return;
        }

        console.log('Contact form payload:', payload);
      });
    });
  };

  const closeMobileMenu = () => {
    document.querySelector('.js-mobile-menu-backdrop')?.classList.remove('open');
    document.querySelector('.js-mobile-menu-panel')?.classList.remove('open');
  };

  const setupMobileMenu = () => {
    const mobileToggle = document.querySelector('.mobile-menu-toggle, .align-justify-icon');

    if (!mobileToggle || mobileToggle.dataset.menuEnhanced === 'true') {
      return;
    }

    mobileToggle.dataset.menuEnhanced = 'true';
    mobileToggle.setAttribute('role', 'button');
    mobileToggle.setAttribute('tabindex', '0');

    if (!mobileToggle.getAttribute('aria-label')) {
      mobileToggle.setAttribute('aria-label', 'Open menu');
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'js-mobile-menu-backdrop';

    const panel = document.createElement('div');
    panel.className = 'js-mobile-menu-panel';

    Object.entries({
      Home: 'home',
      Services: 'services',
      'About me': 'about',
      Portfolio: 'portfolio',
      'Contact me': 'contact',
    }).forEach(([label, key]) => {
      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'js-mobile-menu-item';
      button.textContent = label;

      button.addEventListener('click', () => {
        scrollToSection(key);
        closeMobileMenu();
      });

      panel.appendChild(button);
    });

    const toggleMenu = () => {
      const isOpen = panel.classList.toggle('open');
      backdrop.classList.toggle('open', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    };

    backdrop.addEventListener('click', closeMobileMenu);
    panel.addEventListener('click', (event) => event.stopPropagation());

    document.body.append(backdrop, panel);

    mobileToggle.addEventListener('click', toggleMenu);
    mobileToggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleMenu();
      }
    });

    window.addEventListener('resize', closeMobileMenu);
    window.addEventListener('scroll', closeMobileMenu, { passive: true });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    });
  };

  const setupShell = (shell) => {
    setupNavigation(shell);
    setupPortfolioFilters(shell);
    setupDropdown(shell);
    setupContactValidation(shell);
  };

  const init = () => {
    document.documentElement.style.scrollBehavior = 'smooth';

    const shells = Array.from(
      document.querySelectorAll('.desktop-1, .only-mobile, .iphone-14-15-pro-max-1'),
    );

    const uniqueShells = shells.filter(
      (shell, index, list) => list.findIndex((item) => item === shell) === index,
    );

    uniqueShells.forEach(setupShell);
    setupMobileMenu();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

 
})();