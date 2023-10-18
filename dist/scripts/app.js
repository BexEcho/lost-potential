const formatNumber = function(n, clean) {
  const suffix = {
    en: {
      k: "K",
      m: "M",
      b: "B",
      t: "T"
    },
    de: {
      k: " Tsd.",
      m: " Mio.",
      b: " Mrd.",
      t: " Bio."
    },
    fr: {
      k: " k",
      m: " M",
      b: " Md",
      t: " Bn"
    }
  },
  language = (['de', 'fr'].includes(app.language) ? app.language : 'en');
  if (clean) {
    if (n < 1e3) return parseInt(n, 10);
    if (n >= 1e3 && n < 1e6) return (n / 1e3).toLocaleString(app.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + suffix[language].k;
    if (n >= 1e6 && n < 1e9) return (n / 1e6).toLocaleString(app.locale, { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + suffix[language].m;
    if (n >= 1e9 && n < 1e12) return (n / 1e9).toLocaleString(app.locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + suffix[language].b;
    if (n >= 1e12) return (n / 1e12).toLocaleString(app.locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + suffix[language].t;
  }
  else {
    if (n < 1e3) return parseInt(n, 10);
    if (n >= 1e3 && n < 1e6) return (n / 1e3).toLocaleString(app.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + suffix[language].k;
    if (n >= 1e6 && n < 1e9) return (n / 1e6).toLocaleString(app.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + suffix[language].m;
    if (n >= 1e9 && n < 1e12) return (n / 1e9).toLocaleString(app.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + suffix[language].b;
    if (n >= 1e12) return (n / 1e12).toLocaleString(app.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + suffix[language].t;
  }
},
formatMoney = function(num) {
  if (['de', 'fr'].includes(app.language)) {
    return num + ' US$';
  }
  else {
    return 'US$' + num;
  }
};

const app = {
  body: $('body'),
  basepath: $('body').data('basepath'),
  page: ($('body').data('default-page') ? $('body').data('default-page') : 'problem'),
  data: {},
  region: 'global',
  locale: window.navigator.userLanguage || window.navigator.language,
  language: 'en',
  step: 0,
  year: new Date().getFullYear(),
  windowHeight: $(window).height(),
  windowWidth: $(window).width(),
  scrollTop: 0,
  revealer: $('.revealer'),
  onScreen: function($elem) {
    const offset = $elem.offset();
    return ((offset.top + $elem.height() > 0) && (offset.top < app.windowHeight));
  },
  getTotal: function(dataset, facet, end_year, start_year) {
    let total = 0;
    if (typeof app.data[dataset][facet] === 'undefined') {
      return total;
    }
    if (start_year) {
      start_year = parseInt(start_year, 10);
    }
    if (end_year) {
      end_year = parseInt(end_year, 10);
    }
    if (!start_year) {
      start_year = 2015;
    }
    if (!end_year) {
      // Use now
      end_year = app.year;
      const now = new Date();
      const start = Date.UTC(end_year, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
      const end = Date.UTC(end_year, 0, 1);
      total += ((start - end) / 1000 / 24 / 60 / 60) * app.data[dataset][facet][end_year];
      end_year--;
    }
    for (let year = start_year; year <= end_year; year++) {
      //Use 365 days instead of actual days for leap years
      //total += ((new Date(year+1,0,1).getTime() - new Date(year,0,1).getTime()) / 1000) * app.data[dataset][facet][year] / 24 / 60 / 60;
      total += 365 * app.data[dataset][facet][year];
    }
    return total;
  },
  // Calculate the breakpoint
  updateViewport: function() {
    app.windowHeight = $(window).height();
    app.windowWidth = $(window).width();
    app.viewport = (app.windowWidth >= 1024 ? 'desktop' : (app.windowWidth >= 768 ? 'tablet' : 'mobile'));
  },
  // Update values on resize/load
  resizePage: function() {
    app.body.addClass('is-resizing');
    //app.scrollTop = $(window).scrollTop();
    app.updateViewport();
    const diagonal = Math.sqrt(Math.pow(app.windowWidth, 2) + Math.pow(app.windowHeight, 2));
    app.revealer.css({
      width: diagonal+'px',
      height: diagonal+'px',
      transform: 'translate3d(-50%, -50%, 0px) rotate3d(0, 0, 1, -135deg) translate3d(0px, '+diagonal+'px, 0px)'
    });
    if (app.animations.dots1.two) {
      app.animations.dots1.two.width = app.animations.dots1.canvas.width();
      app.animations.dots1.two.height = app.animations.dots1.canvas.height(),
      app.animations.dots1.two.update();
    }
    if (app.animations.dots2.two) {
      app.animations.dots2.two.width = app.animations.dots2.canvas.width();
      app.animations.dots2.two.height = app.animations.dots2.canvas.height(),
      app.animations.dots2.two.update();
    }
    setTimeout(function(){
      app.body.removeClass('is-resizing');
    }, 500);
  },
  // Runner loop
  updatePage: function() {
    //app.scrollTop = $(window).scrollTop();
    app.animateElements();
    window.requestAnimationFrame(app.updatePage);
  },
  // Check elements for necessary animations/changes
  animateElements: function() {
    app.animations.onView.animate();
    if (app.page === 'problem') {
      app.animations.dateReplacement.animate();
      app.animations.scrolled.animate();
      app.animations.countUp.animate();
      app.animations.dots1.animate();
    }
    if (app.page === 'solution') {
      app.animations.dots2.animate(); // TODO Test if on screen
    }
  },
  animations: {
    scrolled: {
      elements: $('.problem__wrapper'),
      active: true,
      animate: function() {
        if (app.animations.scrolled.active && app.step < 4) {
          if (app.animations.scrolled.elements.offset().top < 0) {
            app.animations.scrolled.active = false;
            app.steps.four();
          }
        }
      }
    },
    dots1: {
      canvas: $('.problem__canvas__inner'),
      two: false,
      active: false,
      lastTime: {
        os: Math.random(),
        c19: Math.random(),
        bau: Math.random(),
      },
      event: {
        count: 0,
        time: 0,
        delta: 0,
        last: 0,
        first: 0
      },
      dots: [],
      animate: function() {
        if (app.animations.dots1.active) {
          const now = new Date().getTime() / 1000;
          if (app.animations.dots1.event.first === 0) {
            app.animations.dots1.event.first = now;
            app.animations.dots1.event.last = now;
          }
          app.animations.dots1.event.time = now - app.animations.dots1.event.first;
          app.animations.dots1.event.delta = now - app.animations.dots1.event.last;
          app.animations.dots1.event.count++;
          for (var i = app.animations.dots1.dots.length - 1; i >= 0; i--) {
            app.animations.dots1.dots[i].iterate(app.animations.dots1.two);
            if (app.animations.dots1.dots[i].offscreen) {
              app.animations.dots1.dots[i].item.remove();
              app.animations.dots1.dots.splice(i, 1);
            }
            if (app.animations.dots1.dots[i].landed) {
              app.animations.dots1.dots[i].item.remove();
              app.animations.dots1.dots.splice(i, 1);
            }
          }
          if (app.step >= 5) {
            if ((app.animations.dots1.event.time - app.animations.dots1.lastTime.os) > (24*60*60/app.data['os_c19']['Both'][app.year])) {
              app.animations.dots1.lastTime.os = app.animations.dots1.event.time;
              app.animations.dots1.dots.push(new Dot(app.animations.dots1.two, '#2E75FE'));
            }
            if ((app.animations.dots1.event.time - app.animations.dots1.lastTime.c19) > (24*60*60/(app.data['lp_c19']['Both'][app.year] - app.data['lp']['Both'][app.year]))) {
              app.animations.dots1.lastTime.c19 = app.animations.dots1.event.time;
              app.animations.dots1.dots.push(new Dot(app.animations.dots1.two, '#FBA55F', true));
            }
            if ((app.animations.dots1.event.time - app.animations.dots1.lastTime.bau) > (24*60*60/app.data['lp']['Both'][app.year])) {
              app.animations.dots1.lastTime.bau = app.animations.dots1.event.time;
              app.animations.dots1.dots.push(new Dot(app.animations.dots1.two, '#2E75FE', true));
            }
          }
          app.animations.dots1.two.update();
        }
      },
      init: function() {
        if (!app.animations.dots1.two) {
          const params = {
            width: app.animations.dots1.canvas.width(),
            height: app.animations.dots1.canvas.height(),
            //type: Two.Types.canvas
          };
          app.animations.dots1.two = new Two(params).appendTo(app.animations.dots1.canvas[0]);
          app.animations.dots1.active = true;
        }
      }
    },
    dots2: {
      canvas: $('.solution__canvas__inner'),
      two: false,
      active: false,
      secured: 0,
      lastTime: {
        os: Math.random(),
        secured: Math.random(),
      },
      event: {
        count: 0,
        time: 0,
        delta: 0,
        last: 0,
        first: 0
      },
      dots: [],
      animate: function() {
        if (app.animations.dots2.active && app.onScreen(app.animations.dots2.canvas)) {
          const now = new Date().getTime() / 1000;
          if (app.animations.dots2.event.first === 0) {
            app.animations.dots2.event.first = now;
            app.animations.dots2.event.last = now;
          }
          app.animations.dots2.event.time = now - app.animations.dots2.event.first;
          app.animations.dots2.event.delta = now - app.animations.dots2.event.last;
          app.animations.dots2.event.count++;
          for (var i = app.animations.dots2.dots.length - 1; i >= 0; i--) {
            app.animations.dots2.dots[i].iterate(app.animations.dots2.two);
            if (app.animations.dots2.dots[i].offscreen) {
              app.animations.dots2.dots[i].item.remove();
              app.animations.dots2.dots.splice(i, 1);
            }
          }
          if ((app.animations.dots2.event.time - app.animations.dots2.lastTime.os) > (24*60*60/app.data['os_c19']['Both'][app.year])) {
            app.animations.dots2.lastTime.os = app.animations.dots2.event.time;
            app.animations.dots2.dots.push(new Dot(app.animations.dots2.two, '#2E75FE'));
          }
          // Calculate additional children
          if (app.animations.dots2.secured > 0 && (app.animations.dots2.event.time - app.animations.dots2.lastTime.secured) > (24*60*60/app.animations.dots2.secured)) {
            app.animations.dots2.lastTime.secured = app.animations.dots2.event.time;
            app.animations.dots2.dots.push(new Dot(app.animations.dots2.two, '#00CFB0'));
          }
          app.animations.dots2.two.update();
        }
      },
      init: function() {
        const params = {
          width: app.animations.dots2.canvas.width(),
          height: app.animations.dots2.canvas.height(),
          //type: Two.Types.canvas
        };
        app.animations.dots2.two = new Two(params).appendTo(app.animations.dots2.canvas[0]);
        app.animations.dots2.active = true;
      }
    },
    countUp: {
      elements: $('.js-countup'),
      lastTime: 0,
      frameDuration: 1000 / 60,
      active: false,
      easing: function(x) {
        // https://easings.net/#easeInQuint
        return x * x * x * x * x;
      },
      run: function(el, countTo, animationDuration) {
        let frame = 0;
        const start = parseInt(el.innerHTML.replace(/[^\d]/g, ''), 10);
        const totalFrames = Math.round(animationDuration / app.animations.countUp.frameDuration);
        const counter = setInterval(function(){
          frame++;
          const progress = app.animations.countUp.easing(frame/totalFrames);
          const currentCount = Math.round((countTo - start) * progress) + start;
          if (parseInt(el.innerHTML, 10) !== currentCount) {
            el.innerHTML = currentCount.toLocaleString(app.locale);
          }
          if (frame === totalFrames ) {
            clearInterval(counter);
          }
        }, app.animations.countUp.frameDuration);
      },
      init: function() {
        if (app.animations.countUp.elements.length) {
          app.animations.countUp.run(app.animations.countUp.elements[0], app.getTotal('lp_c19', 'Both'), 5000);
          setTimeout(function(){
            app.animations.countUp.active = true;
          }, 6000);
        }
      },
      animate: function() {
        if (app.animations.countUp.active) {
          const now = new Date(),
            end = new Date().getTime() / 1000;
            timestamp = parseInt(end, 10);
          if (timestamp > app.animations.countUp.lastTime && app.onScreen(app.animations.countUp.elements)) {
            app.animations.countUp.lastTime = timestamp;
            app.animations.countUp.run(app.animations.countUp.elements[0], app.getTotal('lp_c19', 'Both'), 500);
          }
        }
      }
    },
    dateReplacement: {
      elements: $('[data-date-replacement]'),
      lastTime: 0,
      animate: function() {
        if (app.step === 1) {
          const now = new Date(),
            timestamp = parseInt(now.getTime() / 1000, 10);
          if (timestamp > app.animations.dateReplacement.lastTime) {
            app.animations.dateReplacement.lastTime = timestamp;
            app.animations.dateReplacement.elements.each(function(){
              const $elem = $(this),
                text = $elem.data('date-replacement');
              let date, time;
              if (['de', 'fr'].includes(app.language)) {
                date = now.toLocaleDateString(app.language,{
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                });
                time = now.toLocaleTimeString(app.language,{
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });
              }
              else if (app.region === 'na') {
                const seconds = now.getSeconds();
                date = now.toLocaleDateString("en-US",{
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                }).replace(',', '');
                time = now.toLocaleTimeString("en-US",{
                  hour: "numeric",
                  minute: "2-digit",
                }).toLowerCase() + ' and ' + seconds + ' second' + (seconds !== 1 ? 's' : '');
              }
              else {
                date = now.toLocaleDateString("en-GB",{
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                });
                time = now.toLocaleTimeString("en-GB",{
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });
              }
              $elem.text(text.replace('{{date}}', date).replace('{{time}}', time));
            });
          }
        }
      },
    },
    onView: {
      elements: $('.js-onview'),
      animate: function() {
        if (app.step >= 3) {
          let changed = false;
          app.animations.onView.elements.each(function(i){
            const $elem = $(this);
            if ((app.windowHeight + app.scrollTop - (app.windowHeight/5)) > ($elem.offset().top)) {
              $elem.addClass('is-viewed');
              changed = true;
              if ($elem.hasClass('js-quantification')) {
                $elem.find('svg').addClass('blue');
                setTimeout(function(){
                  $elem.find('svg').addClass('orange');
                }, 2000);
              }
            }
          });
          if (changed) {
            app.animations.onView.elements = $('.js-onview').not('.is-viewed');
          }
        }
      }
    },
  },
  reloadAnimationElements: function() {
    app.animations.onView.elements = $('.js-onview');
  },
  // Handle all custom clicking
  clickHandling: function() {
    app.click.toggle.init();
  },
  click: {
    toggle: {
      init: function() {
        // Check for elements with toggle-page data attributes
        app.body.on('click', '[data-page]', function(e){
          e.preventDefault();
          const page = $(this).data('page');
          if (page === 'advanced' && app.advanced.ready && !app.advanced.active) {
            app.advanced.init();
          }
          if (app.page !== 'advanced' && page !== 'advanced') {
            const target = $(this).prop('href'),
              parts = target.split('#');
            if (typeof parts[1] !== 'undefined') {
              const $target = app.body.find('#'+parts[1]);
              if ($target.length) {
                $target.animate({
                  scrollTop: 0
                }, 0);
              }
            }
            app.body.addClass('is-turning');
            setTimeout(function(){
              app.body.removeClass('is-turning');
            }, 1000);
          }
          $.each(app.body.attr("class").split(' '), function(i, c) {
            if (c.indexOf("page--") === 0) {
              app.body.removeClass(c);
            }
          });
          app.body.addClass('page--'+page);
          app.page = page;
          if (app.animations.dots1.two) {
            app.animations.dots1.two.clear();
            app.animations.dots1.two.update();
            app.animations.dots1.dots = [];
          }
          if (app.animations.dots2.two) {
            app.animations.dots2.two.clear();
            app.animations.dots2.two.update();
            app.animations.dots2.dots = [];
          }
        });
        // Check for elements with toggle-body data attributes
        app.body.on('click', '[data-toggle-body]', function(e){
          e.preventDefault();
          app.body.toggleClass('has-'+$(this).data('toggle-body'));
        });
      }
    }
  },
  quantification: {
    elements: $('.js-quantification'),
    init: function(){
      app.quantification.elements.each(function(){
        const $elem = $(this),
          period = $elem.data('period');
        let count = 0;
        switch (period) {
          case 'hour':
            count = Math.round(app.data['lp_c19']['Both'][app.year] / 24);
          break;
          case 'day':
            count = Math.round(app.data['lp_c19']['Both'][app.year]);
          break;
          case 'week':
            count = Math.round(app.data['lp_c19']['Both'][app.year] * 7);
          break;
          case 'month':
            count = Math.round(app.data['lp_c19']['Both'][app.year] * 30);
          break;
          case 'year':
            count = Math.round(app.data['lp_c19']['Both'][app.year] * 365);
          break;
        }
        $elem.find('.js-quantification-value').html(count.toLocaleString(app.locale));
      });
    },
  },
  inlineSvg: {
    elements: $('.js-inline-svg'),
    init: function() {
      app.body.addClass('region--'+app.region);
      $('.js-number-format').each(function(){
        const $elem = $(this),
          number = $elem.data('number');
        if (number) {
          $elem.text(number.toLocaleString(app.locale));
        }
      });
      app.inlineSvg.elements.each(function(){
        const $elem = $(this),
          path = $elem.data('svg-'+app.region);
        if (path) {
          $elem.load(path, function(){
            const $svg = $elem.find('svg');
            $svg.css({
              'max-width': $svg[0].viewBox.baseVal.width
            });
            $svg.find('circle, ellipse').each(function(){
              $(this).css({
                'transition-delay': Math.round(Math.random() * 2000)+'ms'
              });
            });
          });
        }
      });
    }
  },
  fundingSliders: {
    elements: {
      slider: $('.js-funding-slider'),
      total: $('.js-funding-total'),
      secured: $('.js-funding-secured'),
      gdp: $('.js-funding-gdp'),
      poverty: $('.js-funding-poverty'),
      revenue: $('.js-funding-revenue'),
      lives: $('.js-funding-lives'),
      marriage: $('.js-funding-marriage'),
      malnutrition: $('.js-funding-malnutrition'),
    },
    updateTotal: function(tap){
      let total = 0,
        secured = 0,
        impacts = {"gdp": 0, "poverty": 0,  "revenue": 0, "lives": 0, "marriage": 0, "malnutrition": 0};
      app.fundingSliders.elements.slider.each(function(i){
        let amount = parseFloat($(this)[0].noUiSlider.get()),
          multiplier = amount / 1000000000,
          key = 'High income countries';
        switch (i) {
          case 0: key = 'Low Income Countries'; break;
          case 1: key = 'Lower Middle Income Countries'; break;
          case 2: key = 'Upper Middle Income Countries'; break;
        }
        // Total
        total += amount;
        // Secured
        secured += (typeof app.funding[4][key] !== 'number' ? parseFloat(app.funding[4][key].replace(/[^\d\.]/g, '')) : app.funding[4][key]) * multiplier;
        app.animations.dots2.secured = secured / 10 / 365; // Secured futures over 10 years
        let row = 5;
        $.each(impacts, function(impact){
          impacts[impact] += (typeof app.funding[row][key] !== 'number' ? parseFloat(app.funding[row][key].replace(/[^\d\.]/g, '')) : app.funding[row][key]) * multiplier;
          row++;
        });
      });
      let number = formatMoney(formatNumber(total));
      if (app.fundingSliders.elements.total.text() !== number) {
        app.fundingSliders.elements.total.text(number);
      }
      number = Math.round(secured).toLocaleString(app.locale);
      if (app.fundingSliders.elements.secured.text() !== number) {
        if (tap) {
          app.animations.countUp.run(app.fundingSliders.elements.secured[0], Math.round(secured), 300);
        }
        else {
          app.fundingSliders.elements.secured.text(number);
        }
      }
      $.each(impacts, function(impact, amount){
        number = Math.round(amount).toLocaleString(app.locale);
        if (app.fundingSliders.elements[impact].text() !== number) {
          app.fundingSliders.elements[impact].text(number);
        }
      });
    },
    init: function() {
      app.fundingSliders.elements.slider.each(function(){
        const $elem = $(this),
          $amount = $('#'+$elem.data('amount'));
        noUiSlider.create($elem[0], {
          start: $elem.data('start'),
          orientation: 'vertical',
          direction: 'rtl',
          range: {
            min: $elem.data('min'),
            max: $elem.data('max'),
          },
          step: 250000000,
          pips: {
            mode: 'count',
            values: 2,
            density: 10,
            format: {
              to: function (value) {
                return formatMoney(formatNumber(value, true));
              }
            }
          }
        }).on('slide', function(values, handle, unencoded, tap){
          const amount = formatMoney(formatNumber(values[0]));
          $amount.html(amount);
          app.fundingSliders.updateTotal(tap);
        });
      });
    }
  },
  totalSlider: {
    elements: $('.js-total-slider'),
    init: function(){
      app.totalSlider.elements.each(function(){
        const $elem = $(this);
        let $count, $year;
        if ($elem.data('count-id')) {
          $count = $('#'+$elem.data('count-id'));
        }
        if ($elem.data('year-id')) {
          $year = $('#'+$elem.data('year-id'));
        }
        noUiSlider.create($elem[0], {
          connect: 'lower',
          start: $elem.data('start'),
          step: 1,
          range: {
            min: $elem.data('min'),
            max: $elem.data('max'),
          }
        }).on('update', function(values){
          const year = parseInt(values[0], 10);
          if ($year) {
            $year.html(year);
          }
          if ($count) {
            app.animations.countUp.run($count[0], app.getTotal('lp_c19', 'Both', year), 500);
          }
        });
      });
    }
  },
  advanced: {
    elements: $('.js-advanced-slider'),
    ready: false,
    active: false,
    charts: [],
    barCharts: $('.js-bar-chart'),
    c19: 'on',
    year: 2030,
    datasets: {},
    income: ['Low Income', 'Lower-Middle Income', 'Upper-Middle Income', 'High Income'],
    wb: [
      "East Asia and Pacific",
      "Europe and Central Asia",
      "Latin America and Carribean",
      "Middle East and North Africa",
      "North America",
      "South Asia",
      "Sub-Saharan Africa"
    ],
    un: [
      "East Asia and Pacific",
      "Eastern Europe and Central Asia",
      "Western Europe",
      "Latin America and Carribean",
      "Middle East and North Africa",
      "North America",
      "South Asia",
      "Eastern and Southern Africa",
      "Western and Central Africa"
    ],
    refresh: function(){
      if (app.advanced.barCharts.length) {
        app.advanced.barCharts.each(function(i){
          const $elem = $(this),
            facet = $elem.data('facet'),
            type = $elem.data('type'),
            chart = app.advanced.charts[i];
          if (typeof chart !== 'undefined') {
            chart.data.datasets = app.advanced.datasets[app.advanced.year][app.advanced.c19][type][facet];
            chart.update();
          }
        });
      }
    },
    init: function(){
      app.advanced.active = true;
      Chart.defaults.color = '#081248';
      Chart.defaults.font.family = "'Colfax', Helvetica, Arial, sans-serif";
      Chart.defaults.font.size = 10;
      Chart.defaults.font.lineHeight = 1.7;
      Chart.defaults.elements.bar.backgroundColor = '#2E75FE';
      Chart.defaults.elements.bar.borderColor = '#2E75FE';
      Chart.defaults.elements.bar.borderWidth = 0;
      Chart.defaults.elements.bar.pointStyle = false;

      // Generate datasets for charts
      const datasets = {};
      // Loop through years
      for (let year = 2015; year <= 2030; year++) {
        datasets[year] = {};
        // Loop through COVID-19 toggle
        $.each(['on', 'off'], function(k, c19){
          datasets[year][c19] = {};
          // Loop through Lost Potential vs. Secured Potential
          $.each(['lp', 'os'], function(k, type){
            datasets[year][c19][type] = {};
            // Gender
            $.each(['gender'], function(k, facet){
              if (c19 === 'on') {
                switch (type) {
                  case 'lp':
                  datasets[year][c19][type][facet] = [{
                    data: {
                      "Male": app.getTotal(type, 'Male', year, year),
                      "Female": app.getTotal(type, 'Female', year, year)
                    }
                  }];
                  datasets[year][c19][type][facet].push({
                    backgroundColor: '#FBA55F',
                    data: {
                      "Male": (app.getTotal(type+'_c19', 'Male', year, year) - datasets[year][c19][type][facet][0]['data']['Male']),
                      "Female": (app.getTotal(type+'_c19', 'Female', year, year) - datasets[year][c19][type][facet][0]['data']['Female']),
                    }
                  });
                  break;
                  case 'os':
                  datasets[year][c19][type][facet] = [{
                    data: {
                      "Male": app.getTotal(type+'_c19', 'Male', year, year),
                      "Female": app.getTotal(type+'_c19', 'Female', year, year)
                    }
                  }];
                  datasets[year][c19][type][facet].push({
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    data: {
                      "Male": (app.getTotal(type, 'Male', year, year) - datasets[year][c19][type][facet][0]['data']['Male']),
                      "Female":(app.getTotal(type, 'Female', year, year) - datasets[year][c19][type][facet][0]['data']['Female']),
                    }
                  });
                  break;
                }
              }
              else {
                datasets[year][c19][type][facet] = [{
                  data: {
                    "Male": app.getTotal(type, 'Male', year, year),
                    "Female": app.getTotal(type, 'Female', year, year)
                  }
                }];
              }
            });

            // Income
            let facet = 'income';
            datasets[year][c19][type][facet] = [];
            $.each(['male', 'female'], function(k, gender){
              let dataset = {
                stack: gender,
                data: []
              };
              $.each(app.advanced.income, function(k, group){
                const label = group+': '+gender.replace(/^([a-z])/g, function (letter) { return letter.toUpperCase(); });
                let file = type;
                if (c19 === 'on' && type === 'os') {
                  file += '_c19';
                }
                dataset.data.push(app.getTotal(file, label, year, year));
              });
              datasets[year][c19][type][facet].push(dataset);
              if (c19 === 'on') {
                const prev = datasets[year][c19][type][facet].length - 1;
                dataset = {
                  backgroundColor: (type == 'os') ? 'transparent' : '#FBA55F',
                  borderWidth: (type == 'os') ? 1 : 0,
                  stack: gender,
                  data: []
                };
                $.each(app.advanced.income, function(k, group){
                  const label = group+': '+gender.replace(/^([a-z])/g, function (letter) { return letter.toUpperCase(); }),
                    current = dataset.data.length,
                    delta = datasets[year][c19][type][facet][prev]['data'][current];
                    let file = type;
                    if (!(c19 === 'on' && type === 'os')) {
                      file += '_c19';
                    }
                    dataset.data.push(app.getTotal(file, label, year, year) - delta);
                });
                datasets[year][c19][type][facet].push(dataset);
              }
            });

            // UN/WB
            $.each(['un', 'wb'], function(k, facet){
              datasets[year][c19][type][facet] = [];
              $.each(['male', 'female'], function(k, gender){
                let dataset = {
                  stack: gender,
                  data: []
                };
                $.each(app.advanced[facet], function(k, region){
                  const label = facet.toUpperCase()+' - '+region+': '+gender.replace(/^([a-z])/g, function (letter) { return letter.toUpperCase(); });
                  let file = type;
                  if (c19 === 'on' && type === 'os') {
                    file += '_c19';
                  }
                  dataset.data.push(app.getTotal(file, label, year, year));
                });
                datasets[year][c19][type][facet].push(dataset);
                if (c19 === 'on') {
                  const prev = datasets[year][c19][type][facet].length - 1;
                  dataset = {
                    backgroundColor: (type == 'os') ? 'transparent' : '#FBA55F',
                    borderWidth: (type == 'os') ? 1 : 0,
                    stack: gender,
                    data: []
                  };
                  $.each(app.advanced[facet], function(k, region){
                    const label = facet.toUpperCase()+' - '+region+': '+gender.replace(/^([a-z])/g, function (letter) { return letter.toUpperCase(); }),
                      current = dataset.data.length,
                      delta = datasets[year][c19][type][facet][prev]['data'][current];
                      let file = type;
                      if (!(c19 === 'on' && type === 'os')) {
                        file += '_c19';
                      }
                      dataset.data.push(app.getTotal(file, label, year, year) - delta);
                  });
                  datasets[year][c19][type][facet].push(dataset);
                }
              });
            });

          });
        });
      }
      app.advanced.datasets = datasets;

      $('.js-advanced-covid').on('click', function(e){
        e.preventDefault();
        if (app.advanced.c19 === 'on') {
          app.body.addClass('covid-off');
          app.advanced.c19 = 'off';
        }
        else {
          app.body.removeClass('covid-off');
          app.advanced.c19 = 'on';
        }
        app.advanced.refresh();
      });

      $('.js-advanced-region').on('click', function(e){
        e.preventDefault();
        const $elem = $(this);
        if ($elem.data('un')) {
          app.body.addClass('un');
        }
        else if ($elem.data('wb')) {
          app.body.removeClass('un');
        }
        else {
          app.body.toggleClass('un');
        }
        app.advanced.refresh();
      });

      app.advanced.elements.each(function(){
        const $elem = $(this);
        let $count, $year;
        if ($elem.data('count-id')) {
          $count = $('#'+$elem.data('count-id'));
        }
        if ($elem.data('year-id')) {
          $year = $('#'+$elem.data('year-id'));
        }
        noUiSlider.create($elem[0], {
          connect: 'lower',
          start: $elem.data('start'),
          step: 1,
          range: {
            min: $elem.data('min'),
            max: $elem.data('max'),
          }
        }).on('set', function(values){
          app.advanced.year = parseInt(values[0], 10);
          if ($year) {
            $year.html(app.advanced.year);
          }
          app.advanced.refresh();
        });

        // https://stackoverflow.com/questions/39107172/how-to-customize-border-style-on-chart-js
        if (app.advanced.barCharts.length) {
          app.advanced.barCharts.each(function(i){
            const $elem = $(this),
              facet = $elem.data('facet'),
              type = $elem.data('type'),
              max = $elem.data('max'),
              yTitle = $elem.data('y-title');
            const barChart = {
              type: 'bar',
              data: {datasets: app.advanced.datasets[app.advanced.year ][app.advanced.c19][type][facet]},
              options: {
                responsive: true,
                maintainAspectRatio: false,
                maxBarThickness: 40,
                plugins: {
                  tooltip: {
                    backgroundColor: '#000',
                    cornerRadius: 0,
                    caretSize: 0,
                    mode: 'point',
                    displayColors: false,
                    callbacks: {
                      title: function(tooltipItems, data) {
                        return '';
                      },
                      label: function(context) {
                        return Math.round(context.parsed.y).toLocaleString(app.locale);
                      }
                    },
                    bodyFont: {
                      size: 14,
                      family: "'Colfax', Helvetica, Arial, sans-serif",
                      weight: 700,
                      lineHeight: 1.6
                    },
                    bodySpacing: 10,
                    padding: 10
                  },
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    stacked: true,
                    grid: {
                      display: false,
                      drawBorder: false
                    },
                    ticks: {
                      display: false
                    }
                  },
                  y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                      callback: function(value, index, values) {
                        return (index % 2) ? '' : formatNumber(value, true);
                      },
                      count: 11
                    },
                    grid: {
                      drawBorder: false
                    },
                    title: {
                      display: true,
                      text: yTitle.toUpperCase()
                    }
                  }
                }
              }
            };

            if (typeof app.advanced[facet] !== 'undefined') {
              barChart.data.labels = app.advanced[facet];
            }

            if (max) {
              barChart.options.scales.y.max = max;
            }
            app.advanced.charts.push(new Chart($elem.find('canvas'), barChart));
          });
        }
      });
    }
  },
  steps: {
    timeout: false,
    one: function(){
      clearTimeout(app.steps.timeout);
      app.step = 1;
      app.body.addClass('s1-on');
      app.steps.timeout = setTimeout(function(){
        app.body.addClass('s1-out').removeClass('s1-on');
        app.steps.timeout = setTimeout(function(){
          app.body.addClass('s1-off s2-on').removeClass('s1-out');
          app.steps.timeout = setTimeout(function(){
            app.steps.two();
          }, 1000);
        }, 1000);
      }, 7500);
    },
    two: function(){
      clearTimeout(app.steps.timeout);
      app.windowHeight = $(window).height();
      app.step = 2;
      app.body.addClass('s1-off s2-on').removeClass('s1-on s1-out');
      app.animations.countUp.init();
      app.steps.timeout = setTimeout(function(){
        app.steps.three();
      }, 2000);
    },
    three: function(){
      clearTimeout(app.steps.timeout);
      app.windowHeight = $(window).height();
      app.step = 3;
      app.body.addClass('s1-off s2-on s3-on').removeClass('s1-on s1-out');
      app.steps.timeout = setTimeout(function(){
        app.body.addClass('s3-off');
        app.steps.timeout = setTimeout(function(){
          app.body.addClass('s4-in');
          app.steps.timeout = setTimeout(function(){
            app.steps.four();
          }, 2000);
        }, 1000);
      }, 2000);
    },
    four: function(){
      clearTimeout(app.steps.timeout);
      if (app.animations.countUp.elements.length) {
        app.animations.countUp.active = true;
      }
      app.windowHeight = $(window).height();
      app.step = 4;
      app.body.addClass('s1-off s2-on s3-on s3-off s4-in s4-on').removeClass('s1-on s1-out');
      app.steps.timeout = setTimeout(function(){
        app.steps.five();
      }, 4000);
      app.animations.dots1.init();
    },
    five: function(){
      clearTimeout(app.steps.timeout);
      app.windowHeight = $(window).height();
      app.step = 5;
      app.body.addClass('s1-off s2-on s3-on s3-off s4-in s4-on s5-on').removeClass('s1-on s1-out');
    }
  },
  // Init
  init: function(){

    app.language = app.locale.substr(0, 2).toLowerCase();

    $('a[href]:not([href*="://' + window.location.hostname + '"]):not([href^="."]):not([href^="#"]):not([href^="/"]):not([href^="javascript:"]):not([href^="mailto:"])').attr('target', '_blank').addClass('external');

    // Check for step jumping
    let step = 'one';
    if (window.location.hash) {
      const hash = window.location.hash.substr(1),
        result = hash.split('&').reduce(function (res, item) {
          const parts = item.split('=');
          res[parts[0]] = parts[1];
          return res;
        }, {});
      if (typeof result.step !== 'undefined') {
        step = result.step;
      }
      if (typeof result.country !== 'undefined') {
        if (typeof countries[result.country] !== 'undefined') {
          app.country = result.country;
          if (['NA', 'EU', 'AF'].includes(countries[app.country])) {
            app.region = countries[result.country].toLowerCase();
          }
          app.inlineSvg.init();
        }
      }
      if (typeof result.language !== 'undefined') {
        if (['en', 'de', 'fr'].includes(result.language.toLowerCase())) {
          app.language = result.language.toLowerCase();
        }
      }
    }
    else if (app.page !== 'problem') {
      step = 'five';
    }

    // Check language against markup
    const language = $('html').prop('lang');
    if (language === 'en') {
      if (['de', 'fr'].includes(app.language)) {
        window.open(app.basepath+app.language+'/', '_self');
      }
    }
    else if (['de', 'fr'].includes(language)) {
      app.language = language;
      app.locale = language;
    }

    // Get location
    if (typeof app.country === 'undefined') {
      $.ajax({
        url: 'https://www.one.org/cdn-cgi/trace',
        dataType: 'text',
        success: function(data) {
          const location = data.match(/loc\=(\w+)/i);
          if (location) {
            app.country = location[1];
            if (typeof countries[app.country] !== 'undefined' && ['NA', 'EU', 'AF'].includes(countries[app.country])) {
              app.region = countries[app.country].toLowerCase();
            }
          }
        },
        complete: function() {
          // Load graphics once we have a location
          app.inlineSvg.init();
        }
      });
    }

    // Get data
    const requests = [];
    $.each({
      lp_c19: '7_lp_c19_bau.json',
      lp: '1_lp_bau.json',
      os_c19: '8_os_c19_bau.json',
      os: '2_os_bau.json'
    }, function(k, filename) {
      app.data[k] = {};
      const request = $.ajax({
        url: app.basepath+'data/json/'+filename,
        dataType: 'json',
        success: function(data) {
          $.each(data, function(i, row){
            const key = row[""];
            delete row[""];
            app.data[k][key] = row;
          });
        }
      });
      requests.push(request);
    });
    $.when.apply($,requests).done(function(){
      app.quantification.init();
      app.totalSlider.init();
      app.animations.dots2.init();
      app.advanced.ready = true;
      $.ajax({
        url: app.basepath+'data/json/summary.json',
        dataType: 'json',
        success: function(data) {
          app.funding = data;
        },
        complete: function() {
          app.fundingSliders.init();
        }
      });
    });

    app.body.addClass('page--'+app.page);
    app.resizePage();
    app.clickHandling();
    window.requestAnimationFrame(app.updatePage);
    if (typeof app.steps[step] !== 'undefined') {
      app.steps[step]();
    }

  },
};

$(document).ready(app.init);

$(window).on('load', function() {
  app.resizePage();
  $('body').addClass('is-loaded');
}).on('throttledresize', function() {
  app.resizePage();
});

const gravity = 1.2,
  originY = 130;//80;

const Dot = function(two, color, lost) {
  this.bounces = 0;
  this.lost = (lost || false);
  this.falling = false;
  this.offscreen = false;
  this.landed = false;
  this.direction = 1;
	this.gravity = gravity;
  this.radius = 5;
  this.scaling = 0.5;
  this.color = color;
  this.vector = new Two.Vector(1.8+(Math.random()*0.2), 0.1);
	this.item = two.makeCircle((Math.random() * -50), (originY - (this.radius * this.scaling)), this.radius);
  this.item.fill = this.color;
  this.item.scale = this.scaling;
  this.item.noStroke();
};

Dot.prototype.land = function(b) {
  var dist = this.item.position.getDistance(b.item.position);
  if (dist < (this.radius * this.scaling * 2)) {
    // Limit bounces and just stick the landing
    if (this.bounces > 4) {
      this.landed = true;
    }
    else {
      // Bounce
      this.vector.x = Math.sign(this.vector.x) * 0.5;
      this.vector.y = 3;
      this.gravity = 1/gravity;
      this.direction = -1;
      this.bounces += 1;
    }
  }
},

Dot.prototype.iterate = function(two) {
  // Dot hits the floor
  let ceiling = 0,
    floor = 150;
  const midpoint = two.width / 2,
    delta = (two.width >= 768 ? 80 : 40);

  if (!this.lost) {
    if (this.item.position.x >= (midpoint - 90) && this.item.position.x <= (midpoint + 80)) {
      if (this.item.position.x >= (midpoint - 50) && this.item.position.x <= (midpoint + 20)) {
        floor = 70;
      }
      else {
        floor = 110;
      }
    }
  }
  if (!this.falling && this.item.position.y >= (floor - (this.radius * this.scaling))) {
    if (this.lost && this.item.position.x >= (midpoint - delta)) {
      this.gravity = 1;
      this.falling = true;
      this.vector.y = 2;
      var landingX = Math.random() * two.width,
      deltaX = landingX - this.item.position.x,
      deltaY = two.height - this.item.position.y;
      this.vector.x = (deltaX/deltaY*this.vector.y);
    }
    else {
      if (this.item.position.x >= (midpoint - 90) && this.item.position.x <= (midpoint - 30)) {
        this.vector.y = 3;
      }
      else if (this.item.position.x >= (midpoint) && this.item.position.x <= (midpoint + 120)) {
        this.vector.y = 2.75;
      }
      if (this.item.position.x >= (midpoint + 90)) {
        this.gravity = 1/gravity*1.02;
        this.direction = -1;
      }
      else {
        this.gravity = 1/gravity*1.05;
        this.direction = -1;
      }
    }
  }
  // Dot stalls mid-air
  if (this.vector.y < 0.1) {
    this.vector.y = 0.1;
    this.gravity = gravity;
    this.direction = 1;
  }
  if (this.falling) {
    this.vector.y *= this.gravity;
    //this.item.position += [this.vector.x, this.direction * this.vector.y];
    this.item.position.x += this.vector.x;
    this.item.position.y += this.direction * this.vector.y;
    if (this.item.position.y > (two.height)) {
      this.landed = true;
    }
    // Check for clear landing
    /*
    for (var i = landed.length - 1; i >= 0; i--) {
      this.land(landed[i]);
    }
    if (this.item.position.y > (two.height - (this.radius * this.scaling * 2))) {
      this.landed = true;
    }
    */
  }
  else {
    // Scale dot based on position
    this.item.scale = this.scaling = 0.5 + (0.5 * this.item.position.x / midpoint);
    // Dot hits the ceiling
    if (this.item.position.y <= (ceiling - (this.radius * this.scaling))) {
      this.vector.y = 0.1;
      this.gravity = gravity;
      this.direction = 1;
    }
    this.vector.y *= this.gravity;
    //this.item.position += [this.vector.x, this.direction * this.vector.y];

    this.item.position.x += this.vector.x;
    this.item.position.y += this.direction * this.vector.y;

    // Check if dot makes it offscreen
    if (this.item.position.x > (two.width + (this.radius * this.scaling))) {
      this.offscreen = true;
    }
  }
};

const countries = {"BD": "AS", "BE": "EU", "BF": "AF", "BG": "EU", "BA": "EU", "BB": "NA", "WF": "OC", "BL": "NA", "BM": "NA", "BN": "AS", "BO": "SA", "BH": "AS", "BI": "AF", "BJ": "AF", "BT": "AS", "JM": "NA", "BV": "AN", "BW": "AF", "WS": "OC", "BQ": "NA", "BR": "SA", "BS": "NA", "JE": "EU", "BY": "EU", "BZ": "NA", "RU": "EU", "RW": "AF", "RS": "EU", "TL": "OC", "RE": "AF", "TM": "AS", "TJ": "AS", "RO": "EU", "TK": "OC", "GW": "AF", "GU": "OC", "GT": "NA", "GS": "AN", "GR": "EU", "GQ": "AF", "GP": "NA", "JP": "AS", "GY": "SA", "GG": "EU", "GF": "SA", "GE": "AS", "GD": "NA", "GB": "EU", "GA": "AF", "SV": "NA", "GN": "AF", "GM": "AF", "GL": "NA", "GI": "EU", "GH": "AF", "OM": "AS", "TN": "AF", "JO": "AS", "HR": "EU", "HT": "NA", "HU": "EU", "HK": "AS", "HN": "NA", "HM": "AN", "VE": "SA", "PR": "NA", "PS": "AS", "PW": "OC", "PT": "EU", "SJ": "EU", "PY": "SA", "IQ": "AS", "PA": "NA", "PF": "OC", "PG": "OC", "PE": "SA", "PK": "AS", "PH": "AS", "PN": "OC", "PL": "EU", "PM": "NA", "ZM": "AF", "EH": "AF", "EE": "EU", "EG": "AF", "ZA": "AF", "EC": "SA", "IT": "EU", "VN": "AS", "SB": "OC", "ET": "AF", "SO": "AF", "ZW": "AF", "SA": "AS", "ES": "EU", "ER": "AF", "ME": "EU", "MD": "EU", "MG": "AF", "MF": "NA", "MA": "AF", "MC": "EU", "UZ": "AS", "MM": "AS", "ML": "AF", "MO": "AS", "MN": "AS", "MH": "OC", "MK": "EU", "MU": "AF", "MT": "EU", "MW": "AF", "MV": "AS", "MQ": "NA", "MP": "OC", "MS": "NA", "MR": "AF", "IM": "EU", "UG": "AF", "TZ": "AF", "MY": "AS", "MX": "NA", "IL": "AS", "FR": "EU", "IO": "AS", "SH": "AF", "FI": "EU", "FJ": "OC", "FK": "SA", "FM": "OC", "FO": "EU", "NI": "NA", "NL": "EU", "NO": "EU", "NA": "AF", "VU": "OC", "NC": "OC", "NE": "AF", "NF": "OC", "NG": "AF", "NZ": "OC", "NP": "AS", "NR": "OC", "NU": "OC", "CK": "OC", "XK": "EU", "CI": "AF", "CH": "EU", "CO": "SA", "CN": "AS", "CM": "AF", "CL": "SA", "CC": "AS", "CA": "NA", "CG": "AF", "CF": "AF", "CD": "AF", "CZ": "EU", "CY": "EU", "CX": "AS", "CR": "NA", "CW": "NA", "CV": "AF", "CU": "NA", "SZ": "AF", "SY": "AS", "SX": "NA", "KG": "AS", "KE": "AF", "SS": "AF", "SR": "SA", "KI": "OC", "KH": "AS", "KN": "NA", "KM": "AF", "ST": "AF", "SK": "EU", "KR": "AS", "SI": "EU", "KP": "AS", "KW": "AS", "SN": "AF", "SM": "EU", "SL": "AF", "SC": "AF", "KZ": "AS", "KY": "NA", "SG": "AS", "SE": "EU", "SD": "AF", "DO": "NA", "DM": "NA", "DJ": "AF", "DK": "EU", "VG": "NA", "DE": "EU", "YE": "AS", "DZ": "AF", "US": "NA", "UY": "SA", "YT": "AF", "UM": "OC", "LB": "AS", "LC": "NA", "LA": "AS", "TV": "OC", "TW": "AS", "TT": "NA", "TR": "AS", "LK": "AS", "LI": "EU", "LV": "EU", "TO": "OC", "LT": "EU", "LU": "EU", "LR": "AF", "LS": "AF", "TH": "AS", "TF": "AN", "TG": "AF", "TD": "AF", "TC": "NA", "LY": "AF", "VA": "EU", "VC": "NA", "AE": "AS", "AD": "EU", "AG": "NA", "AF": "AS", "AI": "NA", "VI": "NA", "IS": "EU", "IR": "AS", "AM": "AS", "AL": "EU", "AO": "AF", "AQ": "AN", "AS": "OC", "AR": "SA", "AU": "OC", "AT": "EU", "AW": "NA", "IN": "AS", "AX": "EU", "AZ": "AS", "IE": "EU", "ID": "AS", "UA": "EU", "QA": "AS", "MZ": "AF"};
