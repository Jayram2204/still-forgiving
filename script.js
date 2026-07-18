/* ============================================
   STILL FORGIVING? — Cartoon Interactive Script
   ============================================ */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel)); };

  var REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function () {

    // =============================================
    // 1. THE GATE
    // =============================================
    var gate = $('#gate');
    var gateYes = $('#gate-yes');
    var gateNo = $('#gate-no');
    var gateHint = $('.gate__hint');
    var mainContent = $('#main-content');
    var yesClickCount = 0;
    var yesResponses = [
      'Are you sure? Really sure?',
      'Think about it...',
      'Pretty please?',
      'I\'ll make it worth it, promise.',
      'You\'re being mean but I deserve it.',
      'Okay okay, one more chance?',
      'What if I said pretty please?',
      'I\'m not giving up.',
      'You know you want to say no.',
      'Last try, I swear.',
      '...okay I\'ll just keep asking.'
    ];

    function dismissGate() {
      if (gate) {
        gate.setAttribute('aria-hidden', 'true');
        gate.classList.add('gate--dismissed');
      }
      if (mainContent) mainContent.removeAttribute('aria-hidden');

      setTimeout(function () {
        startHeroMessages();
        initScrollReveals();
        initStarRating();
        initFooterHeartbeat();
        initDoodleReactions();
      }, 400);

      if (gate) {
        setTimeout(function () { gate.remove(); }, 1000);
      }
    }

    if (gateNo) {
      gateNo.addEventListener('click', dismissGate);
    }

    if (gateYes) {
      gateYes.addEventListener('click', function () {
        yesClickCount++;
        if (gateHint) {
          gateHint.textContent = yesResponses[Math.min(yesClickCount - 1, yesResponses.length - 1)];
        }

        if (yesClickCount >= 8) { dismissGate(); return; }

        var btn = gateYes;
        btn.style.pointerEvents = 'none';

        var maxX = window.innerWidth * 0.35;
        var maxY = window.innerHeight * 0.25;
        var randX = (Math.random() - 0.5) * 2 * maxX;
        var randY = (Math.random() - 0.5) * 2 * maxY;

        btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        btn.style.transform = 'translate(' + randX + 'px, ' + randY + 'px) scale(0.85)';
        btn.style.opacity = '0.3';

        var card = gate ? $('.gate__card') : null;
        if (card) {
          card.style.animation = 'none';
          card.offsetHeight;
          card.style.animation = '';
        }

        setTimeout(function () {
          var nx = (Math.random() - 0.5) * maxX * 0.6;
          var ny = (Math.random() - 0.5) * maxY * 0.4;
          btn.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out';
          btn.style.transform = 'translate(' + nx + 'px, ' + ny + 'px) scale(1)';
          btn.style.opacity = '1';

          setTimeout(function () {
            btn.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            btn.style.transform = '';
            btn.style.pointerEvents = '';
          }, 400);
        }, 550);
      });
    }

    if (gate) {
      gate.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') e.preventDefault();
      });
    }


    // =============================================
    // 2. HERO MESSAGE ROTATION (pauses when out of view)
    // =============================================
    var msg1 = $('#msg-1');
    var msg2 = $('#msg-2');
    var currentMsg = 1;
    var heroMsgTimer = null;

    function startHeroMessages() {
      if (REDUCED_MOTION) {
        if (msg1) msg1.classList.add('hero__message--visible');
        return;
      }

      var heroEl = $('#hero');
      if (!heroEl || !('IntersectionObserver' in window)) {
        heroMsgTimer = setInterval(cycleHeroMsg, 4000);
        return;
      }

      var heroObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!heroMsgTimer) {
              heroMsgTimer = setInterval(cycleHeroMsg, 4000);
            }
          } else {
            if (heroMsgTimer) {
              clearInterval(heroMsgTimer);
              heroMsgTimer = null;
            }
          }
        });
      }, { threshold: 0.1 });
      heroObs.observe(heroEl);
    }

    function cycleHeroMsg() {
      var cur = currentMsg === 1 ? msg1 : msg2;
      var nxt = currentMsg === 1 ? msg2 : msg1;
      if (cur) cur.classList.remove('hero__message--visible');
      if (nxt) nxt.classList.add('hero__message--visible');
      currentMsg = currentMsg === 1 ? 2 : 1;
    }


    // =============================================
    // 3. SCROLL REVEAL (IntersectionObserver)
    // =============================================
    function initScrollReveals() {
      var reveals = $$('.reveal');

      if (!('IntersectionObserver' in window)) {
        reveals.forEach(function (el) { el.classList.add('is-visible'); });
        return;
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = parseInt(el.dataset.delay || '0', 10);

            if (REDUCED_MOTION || delay === 0) {
              el.classList.add('is-visible');
            } else {
              setTimeout(function () { el.classList.add('is-visible'); }, delay);
            }

            observer.unobserve(el);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      });

      reveals.forEach(function (el) { observer.observe(el); });

      // Nav heartbeat
      var navHbSvg = $('.nav__heartbeat-divider');
      if (navHbSvg) {
        var navHbLine = $('.heartbeat-line--nav');
        var hbObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && navHbLine) {
              navHbLine.classList.add('is-visible');
              hbObs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.3 });
        hbObs.observe(navHbSvg);
      }
    }


    // =============================================
    // 4. MUSIC PLAYER (simulated)
    // =============================================
    var playBtn = $('#play-btn');
    var playerFill = $('#player-fill');
    var playerCurrent = $('#player-current');
    var vinyl = $('.player__vinyl');
    var isPlaying = false;
    var playerProgress = 0;
    var playerTimer;
    var totalSeconds = 222;

    function formatTime(s) {
      var m = Math.floor(s / 60);
      var sec = Math.floor(s % 60);
      return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function updatePlayerUI() {
      var pct = (playerProgress / totalSeconds) * 100;
      if (playerFill) playerFill.style.width = pct + '%';
      if (playerCurrent) playerCurrent.textContent = formatTime(playerProgress);
    }

    function togglePlay() {
      isPlaying = !isPlaying;
      if (!playBtn) return;

      if (isPlaying) {
        playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        playBtn.setAttribute('aria-label', 'Pause');
        if (vinyl) vinyl.classList.add('spinning');
        playBtn.classList.add('pulsing');

        $$('.music-note').forEach(function (n) { n.style.opacity = ''; });

        playerTimer = setInterval(function () {
          playerProgress += 0.5;
          if (playerProgress >= totalSeconds) playerProgress = 0;
          updatePlayerUI();
        }, 500);
      } else {
        playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><polygon points="6 3 20 12 6 21"/></svg>';
        playBtn.setAttribute('aria-label', 'Play');
        if (vinyl) vinyl.classList.remove('spinning');
        playBtn.classList.remove('pulsing');

        $$('.music-note').forEach(function (n) { n.style.opacity = '0'; });

        clearInterval(playerTimer);
      }
    }

    if (playBtn) playBtn.addEventListener('click', togglePlay);


    // =============================================
    // 5. STAR RATING (replaces forgiveness meter)
    // =============================================
    function initStarRating() {
      var starsContainer = $('#rate-stars');
      var rateMessage = $('#rate-message');
      var stars = $$('.rate__star');
      var currentRating = 0;
      var confettiFired = false;

      if (!starsContainer || !stars.length) return;

      // Set ARIA roles for radiogroup pattern
      starsContainer.setAttribute('role', 'radiogroup');
      stars.forEach(function (star, i) {
        star.setAttribute('role', 'radio');
        star.setAttribute('aria-checked', 'false');
        star.setAttribute('tabindex', i === 0 ? '0' : '-1');
      });

      var ratingMessages = {
        1: "I deserve that. But I'll keep trying.",
        2: "Fair enough. I'm working on it.",
        3: "Baby steps! I'll take it.",
        4: "Almost there! You're too sweet.",
        5: "You just made my whole day. Thank you."
      };

      function setStars(rating) {
        currentRating = rating;
        stars.forEach(function (star, i) {
          var useEl = star.querySelector('.star-path');
          if (useEl) {
            if (i < rating) {
              useEl.style.fill = 'var(--honeycomb)';
              useEl.style.stroke = 'var(--honeycomb)';
              // Bouncy fill animation
              star.style.animation = 'none';
              star.offsetHeight;
              star.style.animation = '';
            } else {
              useEl.style.fill = 'none';
              useEl.style.stroke = 'var(--honeycomb)';
            }
          }
          star.setAttribute('aria-checked', i < rating ? 'true' : 'false');
        });

        if (rateMessage) {
          rateMessage.textContent = ratingMessages[rating] || '';
          rateMessage.style.opacity = '0';
          rateMessage.style.transform = 'translateY(8px)';
          setTimeout(function () {
            rateMessage.style.transition = 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            rateMessage.style.opacity = '1';
            rateMessage.style.transform = 'translateY(0)';
          }, 50);
        }

        // Fire confetti on 5 stars
        if (rating === 5 && !confettiFired) {
          confettiFired = true;
          fireConfetti();
        }
      }

      stars.forEach(function (star) {
        star.addEventListener('click', function () {
          var rating = parseInt(star.dataset.rating, 10);
          setStars(rating);
        });

        // Hover preview
        star.addEventListener('mouseenter', function () {
          var rating = parseInt(star.dataset.rating, 10);
          stars.forEach(function (s, i) {
            var useEl = s.querySelector('.star-path');
            if (useEl) {
              if (i < rating) {
                useEl.style.fill = 'var(--honeycomb)';
                useEl.style.stroke = 'var(--honeycomb)';
                useEl.style.opacity = '0.7';
              } else {
                useEl.style.fill = 'none';
                useEl.style.stroke = 'var(--honeycomb)';
                useEl.style.opacity = '0.4';
              }
            }
          });
        });

        // Keyboard navigation (WAI-ARIA radiogroup pattern)
        star.addEventListener('keydown', function (e) {
          var idx = stars.indexOf(star);
          var newIdx = -1;

          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            newIdx = (idx + 1) % stars.length;
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            newIdx = (idx - 1 + stars.length) % stars.length;
          } else if (e.key === 'Home') {
            e.preventDefault();
            newIdx = 0;
          } else if (e.key === 'End') {
            e.preventDefault();
            newIdx = stars.length - 1;
          } else if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            setStars(parseInt(star.dataset.rating, 10));
            return;
          }

          if (newIdx >= 0) {
            stars[idx].setAttribute('tabindex', '-1');
            stars[newIdx].setAttribute('tabindex', '0');
            stars[newIdx].focus();
            setStars(newIdx + 1);
          }
        });
      });

      // Reset on mouse leave
      starsContainer.addEventListener('mouseleave', function () {
        stars.forEach(function (s) {
          var useEl = s.querySelector('.star-path');
          if (useEl) useEl.style.opacity = '';
        });
        if (currentRating > 0) setStars(currentRating);
      });

      // Animate cat watching the stars
      var rateCat = $('.rate__cat');
      if (rateCat && !REDUCED_MOTION) {
        stars.forEach(function (star) {
          star.addEventListener('mouseenter', function () {
            rateCat.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            rateCat.style.transform = 'translateX(6px)';
          });
          star.addEventListener('mouseleave', function () {
            rateCat.style.transform = '';
          });
        });
      }
    }


    // =============================================
    // 6. CONFETTI
    // =============================================
    function fireConfetti() {
      if (REDUCED_MOTION) return;

      var canvas = $('#confetti-canvas');
      if (!canvas) return;

      var ctx = canvas.getContext('2d');
      if (!ctx) return;

      var dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.classList.add('active');

      var particles = [];
      var colors = ['#C4727F', '#E8A849', '#6B2737', '#A8949A', '#F5EDE6'];
      var particleCount = 150;
      var startTime = performance.now();
      var duration = 4000;
      var displayWidth = window.innerWidth;
      var displayHeight = window.innerHeight;

      function heartPath(x, y, size) {
        ctx.beginPath();
        var topCurveHeight = size * 0.3;
        ctx.moveTo(x, y + topCurveHeight);
        ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
        ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.5, x, y + size);
        ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 1.5, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
        ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
        ctx.closePath();
        ctx.fill();
      }

      for (var i = 0; i < particleCount; i++) {
        var isHeart = Math.random() < 0.3;
        var isStar = !isHeart && Math.random() < 0.2;
        particles.push({
          x: displayWidth / 2 + (Math.random() - 0.5) * displayWidth * 0.6,
          y: displayHeight * 0.4,
          vx: (Math.random() - 0.5) * 14,
          vy: -Math.random() * 20 - 5,
          size: isHeart ? Math.random() * 8 + 5 : Math.random() * 6 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          isHeart: isHeart,
          isStar: isStar,
          opacity: 1
        });
      }

      function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        var rot = Math.PI / 2 * 3;
        var step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (var i = 0; i < spikes; i++) {
          ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
          rot += step;
          ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
          rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
      }

      function animate(now) {
        var elapsed = now - startTime;
        var progress = elapsed / duration;

        if (progress >= 1) {
          ctx.clearRect(0, 0, displayWidth, displayHeight);
          canvas.classList.remove('active');
          return;
        }

        ctx.clearRect(0, 0, displayWidth, displayHeight);

        var fadeOut = progress > 0.6 ? 1 - ((progress - 0.6) / 0.4) : 1;

        particles.forEach(function (p) {
          p.x += p.vx;
          p.vy += 0.35;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = fadeOut;
          ctx.fillStyle = p.color;

          if (p.isHeart) {
            heartPath(0, -p.size / 2, p.size);
          } else if (p.isStar) {
            drawStar(0, 0, 5, p.size, p.size * 0.4);
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          }

          ctx.restore();
        });

        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    }


    // =============================================
    // 7. SMILE / COMPLIMENTS
    // =============================================
    var complimentEl = $('#compliment');
    var smileBtn = $('#smile-btn');
    var complimentIndex = 0;
    var compliments = [
      'You have the kind of laugh that makes strangers smile.',
      'You make "being alive" look really good.',
      'Your patience with me is genuinely superhero-level.',
      'I still get nervous around you, in the best way.',
      'You remember things I say that even I forget.',
      'You make boring errands feel like an adventure.',
      'Your hugs are a whole different frequency.',
      'You look at me like I\'m worth something. That changes everything.',
      'You\'re the reason I try harder.',
      'Even when I\'m wrong, you make me want to be better.',
      'You have this way of making everyone feel seen.',
      'I\'m genuinely funnier when you\'re around. It\'s your fault.',
      'You\'re the plot twist I didn\'t see coming.',
      'You make me believe in the good version of things.',
      'I like who I am when I\'m with you.'
    ];

    function showNextCompliment() {
      if (!complimentEl) return;

      complimentEl.classList.add('smile__compliment--exiting');

      setTimeout(function () {
        complimentIndex = (complimentIndex + 1) % compliments.length;
        complimentEl.textContent = compliments[complimentIndex];
        complimentEl.classList.remove('smile__compliment--exiting');
        complimentEl.classList.add('smile__compliment--entering');

        setTimeout(function () {
          complimentEl.classList.remove('smile__compliment--entering');
        }, 450);
      }, 350);
    }

    if (smileBtn) smileBtn.addEventListener('click', showNextCompliment);


    // =============================================
    // 8. FOOTER HEARTBEAT
    // =============================================
    function initFooterHeartbeat() {
      var footerHb = $('.heartbeat-line--footer');
      if (!footerHb || !('IntersectionObserver' in window)) return;

      var footerSvg = footerHb.closest('svg');
      if (!footerSvg) return;

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            footerHb.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      observer.observe(footerSvg);
    }


    // =============================================
    // 9. INTERACTIVE DOODLE REACTIONS
    // =============================================
    function initDoodleReactions() {
      // Nav buttons: on hover, wobble the mouse character
      var navMouse = $('.nav__mouse');
      $$('.nav__btn').forEach(function (btn) {
        btn.addEventListener('mouseenter', function () {
          if (navMouse && !REDUCED_MOTION) {
            navMouse.style.animation = 'none';
            navMouse.offsetHeight;
            navMouse.style.animation = '';
          }
        });
      });

      // Evidence cards: on hover, spin the doodle accent
      $$('.evidence__card').forEach(function (card) {
        card.addEventListener('mouseenter', function () {
          var accent = card.querySelector('.evidence__doodle-accent');
          if (accent && !REDUCED_MOTION) {
            accent.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s';
            accent.style.transform = 'scale(1.3) rotate(20deg)';
            accent.style.opacity = '1';
          }
        });
        card.addEventListener('mouseleave', function () {
          var accent = card.querySelector('.evidence__doodle-accent');
          if (accent) {
            accent.style.transform = 'scale(1) rotate(0deg)';
            accent.style.opacity = '';
          }
        });
      });

      // Hero cat: follows scroll with eyes (subtle, pauses when out of view)
      var heroCat = $('.doodle-cat--hero');
      if (heroCat && !REDUCED_MOTION) {
        var eyes = heroCat.querySelectorAll('.cat-eye');
        var eyeOrigCx = [];
        eyes.forEach(function (eye) { eyeOrigCx.push(parseFloat(eye.getAttribute('cx'))); });
        var eyeActive = false;
        var ticking = false;

        function updateEyes() {
          var scrollPct = Math.min(window.scrollY / (window.innerHeight * 0.5), 1);
          var eyeOffset = (scrollPct - 0.5) * 3;
          eyes.forEach(function (eye, i) {
            eye.setAttribute('cx', eyeOrigCx[i] + eyeOffset);
          });
          ticking = false;
        }

        var eyeScrollHandler = function () {
          if (eyeActive && !ticking) {
            requestAnimationFrame(updateEyes);
            ticking = true;
          }
        };

        var heroSection = $('#hero');
        if (heroSection && 'IntersectionObserver' in window) {
          var eyeObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                eyeActive = true;
                window.addEventListener('scroll', eyeScrollHandler, { passive: true });
              } else {
                eyeActive = false;
                window.removeEventListener('scroll', eyeScrollHandler);
              }
            });
          }, { threshold: 0 });
          eyeObs.observe(heroSection);
        } else {
          window.addEventListener('scroll', eyeScrollHandler, { passive: true });
          eyeActive = true;
        }
      }

      // Smile card: add a subtle bounce to the doodles on compliment change
      var smileLeft = $('.smile__doodle-left');
      var smileRight = $('.smile__doodle-right');
      if (smileBtn && (smileLeft || smileRight) && !REDUCED_MOTION) {
        smileBtn.addEventListener('click', function () {
          [smileLeft, smileRight].forEach(function (d, i) {
            if (d) {
              d.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
              d.style.transform = 'translateY(-50%) scale(1.4) rotate(' + (i === 0 ? '15' : '-15') + 'deg)';
              setTimeout(function () {
                d.style.transform = 'translateY(-50%) scale(1) rotate(0)';
              }, 300);
            }
          });
        });
      }

      // Random sparkle pop on section titles
      if (!REDUCED_MOTION) {
        $$('.section-title').forEach(function (title) {
          title.addEventListener('mouseenter', function () {
            createSparkle(title);
          });
        });
      }
    }

    // Sparkle particle creator
    function createSparkle(parent) {
      var sparkle = document.createElement('span');
      sparkle.style.cssText = 'position:absolute;pointer-events:none;font-size:1rem;transition:all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);z-index:10;';
      sparkle.textContent = '\u2728';
      sparkle.style.left = Math.random() * 80 + 10 + '%';
      sparkle.style.top = '50%';
      parent.style.position = 'relative';
      parent.appendChild(sparkle);

      requestAnimationFrame(function () {
        sparkle.style.transform = 'translateY(-30px) scale(1.5) rotate(' + (Math.random() * 40 - 20) + 'deg)';
        sparkle.style.opacity = '0';
      });

      setTimeout(function () { sparkle.remove(); }, 700);
    }


    // =============================================
    // 10. KEYBOARD NAVIGATION
    // =============================================
    $$('.nav__btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var target = $(btn.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'start' });
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });


    // =============================================
    // 11. RESIZE HANDLER
    // =============================================
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var canvas = $('#confetti-canvas');
        if (canvas && canvas.classList.contains('active')) {
          var dpr = window.devicePixelRatio || 1;
          canvas.width = window.innerWidth * dpr;
          canvas.height = window.innerHeight * dpr;
          var ctx = canvas.getContext('2d');
          if (ctx) ctx.scale(dpr, dpr);
        }
      }, 200);
    });


    // =============================================
    // 12. CLEANUP ON PAGE UNLOAD
    // =============================================
    window.addEventListener('beforeunload', function () {
      if (heroMsgTimer) { clearInterval(heroMsgTimer); heroMsgTimer = null; }
      if (playerTimer) { clearInterval(playerTimer); playerTimer = null; }
    });

  }); // end onReady
})();
