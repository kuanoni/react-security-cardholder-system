import React from 'react';

const LabeledInput = ({ label, defaultValue, handleChange, disabled }) => {
	return (
		<>
			<label className='label'>{label}</label>
			<input
				className='input'
				type='text'
				defaultValue={defaultValue}
				onChange={(e) => handleChange(e.target.value)}
				placeholder={'Enter ' + label.toLowerCase() + '...'}
				disabled={disabled}
			/>
		</>
	);
};

export default LabeledInput;
