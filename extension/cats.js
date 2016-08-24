(function () {

	var defaultOptions = {

	};

	var catsJS = {
		option: defaultOptions,
		
		_create: function() {
			var self = this;
			
			self._replaced = {
				images: [],
				words: 0
			};

			self._replaceWords();
			self._replaceImages();
		},

		_wrapWord: function(word) {
			return '<span class="replaced pointer">' + word + '</span>';
		},

		_replaceWords: function() {
			var self = this,
				/** Порядок падежей: Творительный, Именительный, Родительный, Дательный, Винительный, Предложный **/
				wordPattern = {
					singular: {
						0: {
							0: 'информацией',
							1: 'информация',
							2: 'информации',
							3: 'информации',
							4: 'информацию',
							5: 'информации'
						},
						1: {
							0: 'новостью',
							1: 'новость',
							2: 'новости',
							3: 'новости',
							4: 'новость',
							5: 'новости'
						},
						2: {
							0: 'комментарием',
							1: 'комментарий',
							2: 'комментария',
							3: 'комментарию',
							4: 'комментарий',
							5: 'комментарии'
						}
					},
					plural: {
						0: {
							0: 'информациями',
							1: 'информации',
							2: 'информаций',
							3: 'информациям',
							4: 'информации',
							5: 'информациях'
						},
						1: {
							0: 'новостями',
							1: 'новости',
							2: 'новостей',
							3: 'новостям',
							4: 'новости',
							5: 'новостях'
						},
						2: {
							0: 'комментариями',
							1: 'комментарии',
							2: 'комментариев',
							3: 'комментариям',
							4: 'комментарии',
							5: 'комментариях'
						}
					}
				},
				wordPreset = {
					singular: {
						0: 'котиком',
						1: 'котик',
						2: 'котика',
						3: 'котику',
						4: 'котика',
						5: 'котике'
					},
					plural: {
						0: 'котиками',
						1: 'котики',
						2: 'котиков',
						3: 'котикам',
						4: 'котиков',
						5: 'котиках'
					}
				};

			$.each(wordPattern.plural, function(index, value) {
				$.each(value, function(key, val) {
					self.element.html(self.element.html().replace(val, self._wrapWord(wordPreset.plural[key])));
					self._replaced.words++;
				});
			});

			$.each(wordPattern.singular, function(index, value) {
				$.each(value, function(key, val) {
					self.element.html(self.element.html().replace(val, self._wrapWord(wordPreset.singular[key])));
					self._replaced.words++;
				});
			});

			$('.replaced').on('mousedown', function(e) {
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
					
				if (width > 100 && height > 100) {
					$.each(aspects, function() {
						if (width / height > parseFloat(this) || height / width < 1 / parseFloat(this)) {
							passable = false;
							return false;
						}
					});
					
					if (passable) {
						self._replaced.images.push($img.clone());
						$img.prop('src', url).prop('title', title).prop('alt', title).addClass('pointer');
						$img.on('mousedown', function(e) {
							if (e.which == 3) {
								self._openModal();
							}
						});
					}
				}
			});
		},
		
		_openModal: function() {
			var self = this;
			
			/** create if non-existant **/
			if (!self.$modal) {
				var $closeButton = $('<button>Закрыть</button>'),
					$div = $('<div class="inner"></div>'),
					$h2 = $('<h2>Картинки, замененные на котиков</h2>'),
					$clear = $('<div class="clear"></div>'),
					$count = $('<h4>' + self._replaced.words + '</h4>')

				self.$modal = $('<div class="dialog"></div>');
				$div.append($h2.clone());
				$div.append($clear);
				$.each(self._replaced.images, function(index, value) {
					value.removeClass('right').addClass('left');
					$div.append(value);
				});
				$div.append($clear);
				
				$h2.text('Количество текстовых котиков:');
				$div.append($h2);
				$div.append($count);
				
				self.$modal.append($div);
				self.$modal.append($closeButton);
				$('body').append(self.$modal);
				
				$closeButton.on('click', function() {
					self.$modal.addClass('none');
				});
			} /** open otherwise **/
				else {
				self.$modal.removeClass('none');
			}
		}
	};
	
	$.widget('custom.catsJS', catsJS);

	console.log('cats loaded');
	$('body').catsJS();

}());