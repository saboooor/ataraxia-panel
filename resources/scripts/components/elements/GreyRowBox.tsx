import styled from 'styled-components';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded-lg no-underline text-neutral-200 items-center bg-neutral-700 p-4 border border-transparent transition-colors duration-150 overflow-hidden`};

    ${props => props.$hoverable !== false && tw`hover:border-neutral-500`};

    & .icon {
        ${tw`w-16 flex items-center justify-center p-3`};
        width: auto;
    }
`;
