import '../styles/SelectionList.scss';

import React, { useEffect, useState } from 'react';
import { faSquare, faSquareCheck } from '@fortawesome/free-regular-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Searchbar from './forms/Searchbar';
import SelectionListRows from './SelectionListRows';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const SelectionList = ({ queryHook, dataKey, initialSelected, saveNewList, closeModal }) => {
	const [searchbarValue, setSearchbarValue] = useState('');
	const [selectedList, setSelectedList] = useState(initialSelected.sort((a, b) => a._id - b._id));
	const [onlyShowSelected, setOnlyShowSelected] = useState(false);

	const query = queryHook(searchbarValue);

	useEffect(() => {
		return () => {
			// remove infiniteQuery cache on unmount
			query.remove();
		};
		// eslint-disable-next-line
	}, []);

	const saveSelected = () => {
		saveNewList(selectedList);
		toast.success(<b>Saved!</b>);
		closeModal();
	};

	return (
		<>
			<div className='header'>
				<h2>Access Groups</h2>
				<button className='btn-exit' onClick={() => closeModal()}>
					<FontAwesomeIcon icon={faXmark} />
				</button>
			</div>
			<div className='body'>
				<Searchbar containerClass={'searchbar-container'} setSearchValue={setSearchbarValue} autoFocus={true} />
				{query.isFetched ? (
					<SelectionListRows
						query={query}
						dataKey={dataKey}
						searchbarValue={searchbarValue}
						onlyShowSelected={onlyShowSelected}
						selectedList={selectedList}
						setSelectedList={setSelectedList}
					/>
				) : (
					<div className='container'>
						<div className='loader' />
					</div>
				)}
			</div>

			<div className='footer'>
				<div className='show-selected' onClick={() => setOnlyShowSelected(!onlyShowSelected)}>
					{onlyShowSelected ? <FontAwesomeIcon icon={faSquareCheck} /> : <FontAwesomeIcon icon={faSquare} />}
					<span>Show selected</span>
				</div>
				<button className='btn cancel' onClick={() => closeModal()}>
					Cancel
				</button>
				<button className='btn save' onClick={() => saveSelected()}>
					Save
				</button>
			</div>
		</>
	);
};

export default SelectionList;
