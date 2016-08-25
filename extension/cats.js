$(function() {

	var catsJS = {
		_create: function() {
			var self = this;

			self._replaced = {
				images: [],
				words: []
			};
			self._readyModal = false;

			self.$modal = $('<div class="dialog none"></div>');
			$(self.element).append(self.$modal);

			self._replaceDOM();
			// console.log('cats loaded');
		},

		_wrapWord: function(word) {
			return '<span class="replaced pointer">' + word + '</span>';
		},

		_uppercasedFirstLetter: function(string) {
			return string.substr(0,1).toUpperCase() + string.substr(1);
		},

		_getTextNodesIn: function(el, pattern) {
			var self = this;

			return $(el).find(':not(iframe)').addBack().contents().filter(function() {
				return this.nodeType == 3 && this.data.indexOf(pattern) !== -1 ||
						this.nodeType == 3 && this.data.indexOf(self._uppercasedFirstLetter(pattern)) !== -1;
			});
		},

		_replaceDOM: function() {
			var self = this;

			self._replaceWords();
			self._replaceImages();
			self._bindDomListener();
		},

		_replaceWords: function() {
			var self = this,
					/** Порядок падежей: Творительный, Родительный, Дательный, Предложный, Именительный, Винительный **/
					wordPattern = {
						plural: {
							0: {
								0: 'информациями',
								1: 'информаций',
								2: 'информациям',
								3: 'информациях',
								4: 'информации',
								5: 'информации'
							},
							1: {
								0: 'новостями',
								1: 'новостей',
								2: 'новостям',
								3: 'новостях',
								4: 'новости',
								5: 'новости'
							},
							2: {
								0: 'комментариями',
								1: 'комментариев',
								2: 'комментариям',
								3: 'комментариях',
								4: 'комментарии',
								5: 'комментарии'
							}
						},
						singular: {
							0: {
								0: 'информацией',
								1: 'информации',
								2: 'информации',
								3: 'информации',
								4: 'информация',
								5: 'информацию'
							},
							1: {
								0: 'новостью',
								1: 'новости',
								2: 'новости',
								3: 'новости',
								4: 'новость',
								5: 'новость'
							},
							2: {
								0: 'комментарием',
								1: 'комментария',
								2: 'комментарию',
								3: 'комментарии',
								4: 'комментарий',
								5: 'комментарий'
							}
						}
					},
					wordPreset = {
						plural: {
							0: 'котиками',
							1: 'котиков',
							2: 'котикам',
							3: 'котиках',
							4: 'котики',
							5: 'котиков'
						},
						singular: {
							0: 'котиком',
							1: 'котика',
							2: 'котику',
							3: 'котике',
							4: 'котик',
							5: 'котика'
						}
					};

			/** find words from pattern and mark all the nodes where these findings occurred **/
			$.each(wordPattern, function(typeKey, type) {
				$.each(type, function(index, value) {
					$.each(value, function(key, pattern) {
						var allTextNodes = self._getTextNodesIn($(self.element), pattern);
						$.each(allTextNodes, function() {
							this.nodeValue = this.nodeValue.replace(pattern, wordPreset[typeKey][key]);
							this.nodeValue = this.nodeValue.replace(self._uppercasedFirstLetter(pattern), self._uppercasedFirstLetter(wordPreset[typeKey][key]));
							$(this).wrap('<span data-replaced="true"></span>');
							self._replaced.words.push(pattern);
						});
					});
				});
			});

			/** deal with marked nodes **/
			$.each(wordPreset, function(i, type) {
				$.each(type, function(key, pattern) {
					$('[data-replaced="true"]').html(function(_, html) {
						return html.replace(pattern, self._wrapWord(pattern));
					});
				});
			});

			$(self.element).find('span.replaced.pointer > span.replaced.pointer').each(function() {
				$(this).parent().html($(this).parent().text());
			});

			$('.replaced.pointer').on('mousedown', function(e) {
				if (e.which == 3) {
					self._openModal();
				}
			});
		},

		_replaceImages: function() {
			var self = this,
					$images = self.element.find('img'),
					url = chrome.extension.getURL('cats.jpg'),
					title = 'cats!';

			$.each($images, function() {
				var $img = $(this),
						width = $img.width(),
						height = $img.height(),
						aspects = [4 / 2],
						passable = true;

				if (!$img.data('cat')) {
					if (width > 100 && height > 100) {
						$.each(aspects, function() {
							if (width / height > parseFloat(this) || height / width < 1 / parseFloat(this)) {
								passable = false;
								return false;
							}
						});

						if (passable) {
							self._replaced.images.push($img.clone());
							$img.prop('src', url).prop('title', title).prop('alt', title).addClass('pointer').data('cat', true);
							$img.on('mousedown', function(e) {
								if (e.which == 3) {
									self._openModal();
								}
							});
						}
					}
				}
			});
		},

		_openModal: function() {
			var self = this;

			/** fill if empty **/
			if (!self._readyModal) {
				self.$modal.empty();
				var $closeButton = $('<button>Закрыть</button>'),
						$div = $('<div class="inner"></div>'),
						$h2 = $('<h2>Картинки, замененные на котиков</h2>'),
						$clear = $('<div class="clear"></div>'),
						$count = $('<h4>' + self._replaced.words.length + '</h4>')

				$div.append($h2.clone());
				$div.append($clear);
				$.each(self._replaced.images, function(index, value) {
					value.removeClass('right').addClass('left').data('cat', true);
					$div.append(value);
				});
				$div.append($clear);

				$h2.text('Количество текстовых котиков:');
				$div.append($h2);
				$div.append($count);

				self.$modal.append($div);
				self.$modal.append($closeButton);
				self.$modal.removeClass('none');

				$closeButton.on('click', function() {
					self.$modal.addClass('none');
				});

				self._readyModal = true;
			} /** open otherwise **/
			else {
				self.$modal.removeClass('none');
			}
		},

		_bindDomListener: function() {
			var self = this;

			$(self.element).one("DOMSubtreeModified", function() {
				if (self._readyModal) {
					self._readyModal = false;
				}
				self._replaceDOM();
			});
		}
	};

	$.widget('custom.catsJS', catsJS);

}());