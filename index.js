function widget() {
    const cardElement = document.querySelector('#card');
    const form = cardElement.querySelector('form');
    const submitBtn = form.querySelector('[type="submit"]');
    const inputs = form.querySelectorAll('.editor .input-group input');

    const validator = (() => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        const validateInput = (inputEl) => {
            if (!inputEl) {
                console.error('Passed invalid element into validateInput()')
                return null;
            }

            const type = inputEl.dataset.targetPlaceholder;
            let value = inputEl.value;

            if (!value.trim()) {
                return 'This field is required';
            }

            value = parseInt(value);
            if (isNaN(value)) {
                return 'This field is not valid';
            }

            switch (type) {
                case 'year': {
                    if (value > currentYear)
                        return 'Must be in the past';
                    if (value < 1900)
                        return 'Must be not less than 1900';
                    break;
                }
                case 'month': {
                    if (!(value > 0 && value < 13))
                        return 'Must be a valid month';
                    break;
                }
                case 'day': {
                    if (!(value > 0 && value < 32))
                        return 'Must be a valid day';
                    break;
                }
            }

            return null;
        }

        return {
            validate: validateInput,
        }
    })();

    const previewSection = (() => {
        const previewContainerElement = cardElement.querySelector('.preview');
        const yearsElements = previewContainerElement.querySelectorAll('[data-placeholder-year]');
        const monthsElements = previewContainerElement.querySelectorAll('[data-placeholder-month]');
        const daysElements = previewContainerElement.querySelectorAll('[data-placeholder-day]');

        const setPreviewElementValue = (value, targetElements) => {
            let strValue = value+'';
            strValue = strValue.length === 1 ? `0${strValue}` : strValue;

            strValue.split('').forEach((char, charIndex) => {
                if (targetElements[charIndex]) {
                    targetElements[charIndex].textContent = char;
                }
            });

            const labelElement = targetElements[0].parentElement.querySelector('.preview-label');
            const labelText = labelElement.textContent;
            if (1 === value && labelText.slice(-1) === 's') { // single pronunciation formula in label
                labelElement.textContent = labelText.slice(0, labelText.length - 1);
            } else if (1 !== value && labelText.slice(-1) !== 's') {
                labelElement.textContent += 's';
            }
        }

        return {
            updatePreview: ({ days, months, years }) => {
                setPreviewElementValue(days, daysElements);
                setPreviewElementValue(months, monthsElements);
                setPreviewElementValue(years, yearsElements);
            }
        }
    })();

    inputs.forEach(inputElement => {
        inputElement.addEventListener('input', function (evt) {
            this.value = this.value.replace(/\D/g, '');
        });
    });

    form.addEventListener('submit', function (evt) {
        evt.preventDefault();

        const currentDate = new Date();

        // Validate
        let preparedDate = {};
        inputs.forEach((inputElement) => {
            const dataTarget = inputElement.dataset.targetPlaceholder;
            const parentElement = inputElement.parentElement;
            const errorMessage = validator.validate(inputElement);
            parentElement.querySelector('.constraint-message')?.remove();
            if (errorMessage) {
                const errorElement = document.createElement('span');
                errorElement.classList.add('constraint-message');
                errorElement.textContent = errorMessage;
                parentElement.append(errorElement);
                if (!parentElement.classList.contains('invalid-input')) {
                    parentElement.classList.add('invalid-input');
                }
            } else {
                preparedDate[dataTarget] = inputElement.value;
                if (parentElement.classList.contains('invalid-input')) {
                    parentElement.classList.remove('invalid-input');
                }
            }
        });

        // Update preview
        if (Object.keys(preparedDate).length !== 3) // valid: year, month, day
            return false;

        const birthDate = new Date(`${preparedDate['year']}-${preparedDate['month']}-${preparedDate['day']}`);
        if (birthDate.getTime() > currentDate.getTime()) {
            // TODO: show error: birthday date is in future
            return ;
        }

        const dateSinceBirthday = dateDiff(birthDate, currentDate);
        previewSection.updatePreview(dateSinceBirthday);
    });

    /**
     * @param {Date} date1
     * @param {Date} date2
     */
    function dateDiff(date1, date2) {
        if (!(date1 instanceof Date) || !(date2 instanceof Date))
            return null;

        const date1UTC = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
        const date2UTC = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

        let diffTime = date2UTC - date1UTC;
        console.log(diffTime);
        const yearsPast = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
        diffTime -= yearsPast * (1000 * 60 * 60 * 24 * 365.25); // remove years

        const monthsPast = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.4375));
        diffTime -= monthsPast * (1000 * 60 * 60 * 24 * 30.4375); // remove months

        const daysPast = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return {
            days: daysPast,
            months: monthsPast,
            years: yearsPast,
        }
    }
}

widget();
